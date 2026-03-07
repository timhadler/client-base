// npx jest tests/services/reminder.services.test.js

// Mock dependencies
jest.mock('../../src/models/reminder.models');
jest.mock('../../src/models/attempt.models');
jest.mock('../../src/models/client.models');
jest.mock('../../src/config/database', () => ({
    getConnection: jest.fn(), 
    query: jest.fn(), 
    end: jest.fn()
}));

const service = require('../../src/services/reminder.services');

const reminderModels = require('../../src/models/reminder.models');
const attemptModels = require('../../src/models/attempt.models');
const clientModels = require('../../src/models/client.models');
const db = require('../../src/config/database');

// Mock function return values
const mockGetAttemptId = 10;
const mockCreateAttemptId = 25;
const mockReminderList = [ { id: 1, clientName: 'John Doe', date: '2024-12-01' }, { id: 2, clientName: 'Jane Smith', date: '2024-12-01' } ]
 
let mockConnection;
function createMockConnection() {
    return {
        beginTransaction: jest.fn(), 
        commit: jest.fn(), 
        rollback: jest.fn(),
        release: jest.fn()
    }
}

beforeEach(() => {
    mockConnection = createMockConnection();

    // Default mock returns
    db.getConnection.mockResolvedValue(mockConnection);

    reminderModels.getReminderList.mockResolvedValue(mockReminderList);
    reminderModels.getAttemptIdFromReminder.mockResolvedValue(mockGetAttemptId);
    attemptModels.createAttempt.mockResolvedValue(mockCreateAttemptId);
    reminderModels.getReminderCount.mockImplementation((filter) => {
        const counts = {
            'overdue': 5,
            'today': 10,
            'thisMonth': 25,
            'followUp': 8
        };
        const f = typeof filter === 'string' ? filter : filter.tab;
        return Promise.resolve(counts[f] || 0);
    });
})

afterEach(() => {
    jest.clearAllMocks();
});

// Get reminder list
describe('loadReminderList', () => {
    const baseParams = {
        filters: {
            tab: 'today', 
            dateFilterType: 'any',
            dateFrom: 'null',
            dateTo: 'null',
            important: 'false',
            reminderCount: '1'
        },
        limit: 20,
        offset: 0,
        userId: 100
    };

    describe('successful data loading', () => {
        test('should load reminder list with all counts and data', async () => {
            const result = await service.loadReminderList(baseParams);

            expect(result).toEqual({
                listCounts: {
                    overdue: 5,
                    today: 10,
                    thisMonth: 25,
                    followUp: 8
                },
                listData: mockReminderList,
                total: 10
            });
        });

        test('should call all count functions with correct userId and filter', async () => {
            await service.loadReminderList(baseParams);

            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('overdue', 100);
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('today', 100);
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('thisMonth', 100);
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('followUp', 100);
            expect(reminderModels.getReminderCount).toHaveBeenCalledTimes(5);
        });

        test('should call getReminderList with correct parameters', async () => {
            await service.loadReminderList(baseParams);

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                baseParams.filters,
                baseParams.limit,
                baseParams.offset,
                baseParams.userId
            );
        });
    });

    describe('edge cases', () => {
        test('should handle empty reminder list', async () => {
            reminderModels.getReminderList.mockResolvedValue([]);
            const result = await service.loadReminderList(baseParams);

            expect(result.listData).toEqual([]);
        });
    });

    describe('error handling', () => {
        test('should throw error if getReminderCount fails', async () => {
            reminderModels.getReminderCount.mockRejectedValue(new Error('Database error'));

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Database error');
        });

        test('should throw error if getReminderList fails', async () => {
            reminderModels.getReminderList.mockRejectedValue(new Error('Query failed'));

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Query failed');
        });
    });

    describe('Promise.all behavior', () => {
        test('should fail if any count query fails', async () => {
            reminderModels.getReminderCount.mockImplementation((filter) => {
                if (filter === 'today') {
                    return Promise.reject(new Error('Today count failed'));
                }
                return Promise.resolve(10);
            });

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Today count failed');
        });
    });
});

// Add reminder
describe('addReminder', () => {
    const baseParams = {
        date: '2026-01-15', 
        important: true, 
        note: 'Test note', 
        reminderCount: 2, 
        clientId: 1, 
        userId: 100
    }
    test('should create an attempt, a reminder, and update client next contact', async () => {
        await service.addReminder(baseParams);

        expect(attemptModels.createAttempt).toHaveBeenCalledWith(1, 100, mockConnection);
        expect(reminderModels.createReminder).toHaveBeenCalledWith(
            mockCreateAttemptId, '2026-01-15', true, 'Test note', 2, 1, 100, mockConnection
        );
        expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(1, 100, mockConnection);
    })

    test('should handle external transaction', async () => {
        await service.addReminder(baseParams, mockConnection);

        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
        expect(mockConnection.commit).not.toHaveBeenCalled();
        expect(mockConnection.release).not.toHaveBeenCalled();
    });

    test('should handle no external transaction', async () => {
        await service.addReminder(baseParams);

        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
    });

    test('should rollback on error with no external connection', async () => {
        attemptModels.createAttempt.mockRejectedValue(new Error('DB error'));

        await expect(service.addReminder(baseParams)).rejects.toThrow('DB error');

        expect(mockConnection.rollback).toHaveBeenCalled();
    });

    test('should not rollback on error with external connection', async () => {
        attemptModels.createAttempt.mockRejectedValue(new Error('DB error'));

        await expect(service.addReminder(baseParams, mockConnection)).rejects.toThrow('DB error');

        expect(mockConnection.rollback).not.toHaveBeenCalled();
    });
})

// Complete reminder
describe('completeReminder - Decision Table Tests', () => {
    // Base payload for tests
    const basePayload = {
    clientId: 1,
    userId: 100,
    reminderId: 500,
    reminderCount: 1,
    method: 'call',
    outcome: 'booked',
    important: 'false',
    createNewReminder: false,
    moveToNextCycle: false,
    newReminderDate: '2024-12-01',
    newReminderNote: 'Follow up'
    };

    describe('call + booked scenarios', () => {
        test('call + booked + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, update client last contact
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId, 
                'call', 
                'booked', 
                basePayload.reminderCount + 1,
                basePayload.userId, 
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'booked',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(attemptModels.createAttempt).not.toHaveBeenCalled();
            expect(reminderModels.createReminder).not.toHaveBeenCalled();
        });

        test('call + booked + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, create new attempt, create new reminder, update client last contact
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId, 
                basePayload.newReminderDate, 
                basePayload.important, 
                basePayload.newReminderNote, 
                0, 
                basePayload.clientId, 
                basePayload.userId, 
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'booked',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'booked',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
        });
    });

    describe('call + declined scenarios', () => {
        test('call + declined + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'declined',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, update client last contact
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'declined',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.createAttempt).not.toHaveBeenCalled();
        });

        test('call + declined + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'declined',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, create new attempt, create new reminder, update client last contact
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId, 
                basePayload.newReminderDate, 
                basePayload.important, 
                basePayload.newReminderNote, 
                0, 
                basePayload.clientId, 
                basePayload.userId, 
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'declined',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'declined',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
        });
    });

    describe('call + no_answer scenarios', () => {
        test('call + no_answer + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'no_answer',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(attemptModels.resolveAttempt).not.toHaveBeenCalled();
            expect(reminderModels.createReminder).not.toHaveBeenCalled();
        });

        test('call + no_answer + moveToNextCycle=false + createNewReminder=true', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'no_answer',
                moveToNextCycle: false,
                createNewReminder: true
            });

            // Should complete reminder, create new reminder (count+1)
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                basePayload.reminderCount + 1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
        });

        test('call + no_answer + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'no_answer',
                moveToNextCycle: true,
                createNewReminder: false
            });
            // Should complete reminder, abandon attempt, create new attempt
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                0,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'no_answer',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });
    });

    describe('call + followup scenarios', () => {
        test('call + followup + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'followup',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should do nothing - expect user to add new reminder
            expect(reminderModels.completeReminder).not.toHaveBeenCalled();
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(attemptModels.resolveAttempt).not.toHaveBeenCalled();
            expect(reminderModels.createReminder).not.toHaveBeenCalled();
            expect(clientModels.updateClientLastContact).not.toHaveBeenCalled();
            expect(clientModels.updateClientNextContact).not.toHaveBeenCalled();
            expect(mockConnection.commit).not.toHaveBeenCalled();
        });

        test('call + followup + moveToNextCycle=false + createNewReminder=true', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'followup',
                moveToNextCycle: false,
                createNewReminder: true
            });

            // Should complete reminder, create new reminder (important=true), update client last contact
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'followup',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'followup',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                basePayload.reminderCount + 1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });
    });

    describe('text + waiting scenarios', () => {
        test('text + waiting + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'text',
                outcome: 'waiting',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'text',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });

        test('text + waiting + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'text',
                outcome: 'waiting',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt, create new attempt
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                0,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'text',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });

        test('text + waiting + moveToNextCycle=false + createNewReminder=true', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'text',
                outcome: 'waiting',
                moveToNextCycle: false,
                createNewReminder: true
            });

            // Should complete reminder, create new reminder (count+1)
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'text',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                basePayload.reminderCount + 1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });
    });

    describe('email + waiting scenarios', () => {
        test('email + waiting + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'email',
                outcome: 'waiting',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'email',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });

        test('email + waiting + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'email',
                outcome: 'waiting',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt, create new attempt
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                0,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'email',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });

        test('email + waiting + moveToNextCycle=false + createNewReminder=true', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'email',
                outcome: 'waiting',
                moveToNextCycle: false,
                createNewReminder: true
            });

            // Should complete reminder, create new reminder (count+1)
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'email',
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'waiting',
                basePayload.reminderCount + 1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                basePayload.reminderCount + 1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });
    });

    describe('ignore + none scenarios', () => {
        test('ignore + none + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'ignored',
                outcome: 'none',
                moveToNextCycle: false,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt, NO client timestamp updates, no increment reminder count
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'ignored',
                'none',
                basePayload.reminderCount,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'none',
                basePayload.reminderCount,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).not.toHaveBeenCalled();
            expect(attemptModels.setFirstReminderSentAt).not.toHaveBeenCalled();
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });

        test('ignore + none + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'ignored',
                outcome: 'none',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, abandon attempt, create new attempt, NO client timestamp updates
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockCreateAttemptId,
                basePayload.newReminderDate,
                basePayload.important,
                basePayload.newReminderNote,
                0,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'ignored',
                'none',
                basePayload.reminderCount,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.updateAttempt).toHaveBeenCalledWith(
                mockGetAttemptId,
                'none',
                basePayload.reminderCount,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientLastContact).not.toHaveBeenCalled();
            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(basePayload.clientId, basePayload.userId, mockConnection);
        });
    });

    describe('Additional workflow tests', () => {
        test('should set first_reminder_sent_at for reminder #0 (non-ignore method)', async () => {
            await service.completeReminder({
                ...basePayload,
                reminderCount: 0,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: false,
                createNewReminder: false
            });

            expect(attemptModels.setFirstReminderSentAt).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.userId,
                mockConnection
            );
        });

        test('should NOT set first_reminder_sent_at for reminder #0 with ignore method', async () => {
            await service.completeReminder({
                ...basePayload,
                reminderCount: 0,
                method: 'ignored',
                outcome: 'none',
                moveToNextCycle: false,
                createNewReminder: false
            });

            expect(attemptModels.setFirstReminderSentAt).not.toHaveBeenCalled();
        });

        test('should NOT set first_reminder_sent_at for reminder #1', async () => {
            await service.completeReminder({
                ...basePayload,
                reminderCount: 1,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: false,
                createNewReminder: false
            });

            expect(attemptModels.setFirstReminderSentAt).not.toHaveBeenCalled();
        });

        describe('successful transaction block', () => {
            test('should begin transaction, commit, and release', async () => {
                await service.completeReminder(basePayload);

                expect(mockConnection.beginTransaction).toHaveBeenCalled();
                expect(mockConnection.commit).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
            });

            test('should rollback transaction on error', async () => {
                reminderModels.getAttemptIdFromReminder.mockRejectedValue(new Error('Database error'));

                await expect(service.completeReminder({
                    ...basePayload
                })).rejects.toThrow('Database error');

                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
            });
        });
    });
});

// Edit reminder
describe('editReminder', () => {
    const baseParams = {
        date: '2024-12-15',
        important: true,
        note: 'Follow up appointment',
        id: 500,
        userId: 100
    };
    test('should call functions with correct parameters', async () => {
        await service.editReminder(baseParams);

        expect(reminderModels.editReminder).toHaveBeenCalledWith(
            500,
            '2024-12-15',
            true,
            'Follow up appointment',
            100,
            mockConnection
        );
        expect(clientModels.updateClientNextContactFromReminder).toHaveBeenCalledWith(
            500,
            100,
            mockConnection
        );
    });

    test('should begin transaction, commit, and release', async () => {
        await service.editReminder(baseParams);

        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
    });

    test('should rollback on error', async () => {
        reminderModels.editReminder.mockRejectedValue(new Error('Database error'));

        await expect(service.editReminder(baseParams)).rejects.toThrow('Database error');
        expect(mockConnection.rollback).toHaveBeenCalled();
    });
});
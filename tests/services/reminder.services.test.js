// npx jest tests/services/reminder.services.test.js

// Mock dependencies
jest.mock('../../src/models/reminder.models');
jest.mock('../../src/models/attempt.models');
jest.mock('../../src/models/client.models');
jest.mock('../../src/database', () => ({
    getConnection: jest.fn(), 
    query: jest.fn(), 
    end: jest.fn()
}));

const service = require('../../src/services/reminder.services');

const reminderModels = require('../../src/models/reminder.models');
const attemptModels = require('../../src/models/attempt.models');
const clientModels = require('../../src/models/client.models');
const db = require('../../src/database');

// Mock function return values
const mockGetAttemptId = 10;
const mockCreateAttemptId = 25;
const mockReminderList = [ { id: 1, clientName: 'John Doe', date: '2024-12-01' }, { id: 2, clientName: 'Jane Smith', date: '2024-12-01' } ]
const mockReminderCount = 10;
 
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
    reminderModels.getReminderCount.mockResolvedValue(mockReminderCount);
    reminderModels.getAttemptIdFromReminder.mockResolvedValue(mockGetAttemptId);
    attemptModels.createAttempt.mockResolvedValue(mockCreateAttemptId);
    reminderModels.nReminderListCount.mockImplementation((filter) => {
        const counts = {
            'overdue': 5,
            'today': 10,
            'thisMonth': 25,
            'followUp': 8
        };
        return Promise.resolve(counts[filter] || 0);
    });
})

afterEach(() => {
    jest.clearAllMocks();
});

// Get reminder list
describe('loadReminderList', () => {
    const baseParams = {
        filter: 'today',
        reminderCount: null,
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
                total: mockReminderCount
            });
        });

        test('should call all count functions with correct userId', async () => {
            await service.loadReminderList(baseParams);

            expect(reminderModels.nReminderListCount).toHaveBeenCalledWith('overdue', 100);
            expect(reminderModels.nReminderListCount).toHaveBeenCalledWith('today', 100);
            expect(reminderModels.nReminderListCount).toHaveBeenCalledWith('thisMonth', 100);
            expect(reminderModels.nReminderListCount).toHaveBeenCalledWith('followUp', 100);
            expect(reminderModels.nReminderListCount).toHaveBeenCalledTimes(4);
        });

        test('should call getReminderList with correct parameters', async () => {
            await service.loadReminderList(baseParams);

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                0,
                100,
                null
            );
        });

        test('should call getReminderCount with correct filter and userId', async () => {
            await service.loadReminderList(baseParams);

            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('today', 100);
        });
    });

    describe('different filter scenarios', () => {
        test('should work with overdue filter', async () => {
            const result = await service.loadReminderList({
                ...baseParams,
                filter: 'overdue'
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'overdue',
                20,
                0,
                100,
                null
            );
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('overdue', 100);
            expect(result.listCounts.overdue).toBe(5);
        });

        test('should work with thisMonth filter', async () => {
            const result = await service.loadReminderList({
                ...baseParams,
                filter: 'thisMonth'
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'thisMonth',
                20,
                0,
                100,
                null
            );
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('thisMonth', 100);
            expect(result.listCounts.thisMonth).toBe(25);
        });

        test('should work with followUp filter', async () => {
            const result = await service.loadReminderList({
                ...baseParams,
                filter: 'followUp'
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'followUp',
                20,
                0,
                100,
                null
            );
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('followUp', 100);
            expect(result.listCounts.followUp).toBe(8);
        });
    });

    describe('pagination scenarios', () => {
        test('should handle custom limit', async () => {
            await service.loadReminderList({
                ...baseParams,
                limit: 50
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                50,
                0,
                100,
                null
            );
        });

        test('should handle custom offset', async () => {
            await service.loadReminderList({
                ...baseParams,
                offset: 40
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                40,
                100,
                null
            );
        });

        test('should handle both custom limit and offset', async () => {
            await service.loadReminderList({
                ...baseParams,
                limit: 100,
                offset: 200
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                100,
                200,
                100,
                null
            );
        });
    });

    describe('reminderCount scenarios', () => {
        test('should pass reminderCount when provided', async () => {
            await service.loadReminderList({
                ...baseParams,
                reminderCount: 3
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                0,
                100,
                3
            );
        });

        test('should pass null reminderCount by default', async () => {
            await service.loadReminderList({
                ...baseParams,
                reminderCount: null
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                0,
                100,
                null
            );
        });

        test('should pass zero reminderCount', async () => {
            await service.loadReminderList({
                ...baseParams,
                reminderCount: 0
            });

            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                0,
                100,
                0
            );
        });
    });

    describe('edge cases', () => {
        test('should handle empty reminder list', async () => {
            reminderModels.getReminderList.mockResolvedValue([]);
            reminderModels.getReminderCount.mockResolvedValue(0);

            const result = await service.loadReminderList(baseParams);

            expect(result.listData).toEqual([]);
            expect(result.total).toBe(0);
            expect(result.listCounts).toEqual({
                overdue: 5,
                today: 10,
                thisMonth: 25,
                followUp: 8
            });
        });

        test('should handle all counts being zero', async () => {
            reminderModels.nReminderListCount.mockResolvedValue(0);
            reminderModels.getReminderList.mockResolvedValue([]);
            reminderModels.getReminderCount.mockResolvedValue(0);

            const result = await service.loadReminderList(baseParams);

            expect(result.listCounts).toEqual({
                overdue: 0,
                today: 0,
                thisMonth: 0,
                followUp: 0
            });
        });

        test('should handle large counts', async () => {
            reminderModels.nReminderListCount.mockImplementation((filter) => {
                const counts = {
                    'overdue': 1000,
                    'today': 2000,
                    'thisMonth': 5000,
                    'followUp': 500
                };
                return Promise.resolve(counts[filter] || 0);
            });
            reminderModels.getReminderCount.mockResolvedValue(2000);

            const result = await service.loadReminderList(baseParams);

            expect(result.listCounts).toEqual({
                overdue: 1000,
                today: 2000,
                thisMonth: 5000,
                followUp: 500
            });
            expect(result.total).toBe(2000);
        });
    });

    describe('error handling', () => {
        test('should throw error if nReminderListCount fails', async () => {
            reminderModels.nReminderListCount.mockRejectedValue(new Error('Database error'));

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Database error');
        });

        test('should throw error if getReminderList fails', async () => {
            reminderModels.getReminderList.mockRejectedValue(new Error('Query failed'));

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Query failed');
        });

        test('should throw error if getReminderCount fails', async () => {
            reminderModels.getReminderCount.mockRejectedValue(new Error('Count failed'));

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Count failed');
        });
    });

    describe('Promise.all behavior', () => {
        test('should execute all count queries in parallel', async () => {
            const startTime = Date.now();
            
            // Mock each count call to take 100ms
            reminderModels.nReminderListCount.mockImplementation((filter) => {
                return new Promise(resolve => {
                    setTimeout(() => resolve(10), 100);
                });
            });

            await service.loadReminderList(baseParams);
            
            const duration = Date.now() - startTime;
            
            // Should take ~100ms (parallel) not ~400ms (sequential)
            expect(duration).toBeLessThan(200);
            expect(reminderModels.nReminderListCount).toHaveBeenCalledTimes(4);
        });

        test('should fail fast if any count query fails', async () => {
            reminderModels.nReminderListCount.mockImplementation((filter) => {
                if (filter === 'today') {
                    return Promise.reject(new Error('Today count failed'));
                }
                return Promise.resolve(10);
            });

            await expect(service.loadReminderList(baseParams)).rejects.toThrow('Today count failed');
        });
    });

    describe('different user scenarios', () => {
        test('should work with different userId', async () => {
            await service.loadReminderList({
                ...baseParams,
                userId: 999
            });

            expect(reminderModels.nReminderListCount).toHaveBeenCalledWith('overdue', 999);
            expect(reminderModels.getReminderList).toHaveBeenCalledWith(
                'today',
                20,
                0,
                999,
                null
            );
            expect(reminderModels.getReminderCount).toHaveBeenCalledWith('today', 999);
        });
    });
});

// Add reminder
describe('addReminder', () => {
    test('should create an attempt, a reminder, and update client next contact', async () => {
        await service.addReminder({
            date: '2026-01-15', 
            important: true, 
            note: 'Test note', 
            reminderCount: 2, 
            clientId: 1, 
            userId: 100
        });

        expect(attemptModels.createAttempt).toHaveBeenCalledWith(1, 100, mockConnection);
        expect(reminderModels.createReminder).toHaveBeenCalledWith(
            mockCreateAttemptId, '2026-01-15', true, 'Test note', 2, 1, 100, mockConnection
        );
        expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(1, 100, mockConnection);
        expect(mockConnection.commit).toHaveBeenCalled();
    })

    test('should rollback on error', async () => {
        attemptModels.createAttempt.mockRejectedValue(new Error('DB error'));

        await expect(service.addReminder({
            date: '2024-12-01',
            important: true,
            note: 'Follow up',
            reminderCount: 0,
            clientId: 1,
            userId: 100
        })).rejects.toThrow('DB error');

        expect(mockConnection.rollback).toHaveBeenCalled();
    });
})

// Complete reminder
describe('completeReminder - Decision Table Tests', () => {
    // Base payload for tests
    const basePayload = {
    clientId: 1,
    userId: 100,
    reminderId: 500,
    reminderCount: 0,
    method: 'call',
    outcome: 'booked',
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.createAttempt).not.toHaveBeenCalled();
            expect(reminderModels.createReminder).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        test('call + booked + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, create new attempt, update client last contact
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'booked',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.createAttempt).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        test('call + declined + moveToNextCycle=true + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'declined',
                moveToNextCycle: true,
                createNewReminder: false
            });

            // Should complete reminder, resolve attempt, create new attempt, update client last contact
            expect(attemptModels.createAttempt).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'declined',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.resolveAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(attemptModels.resolveAttempt).not.toHaveBeenCalled();
            expect(reminderModels.createReminder).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId, // existing attempt ID
                basePayload.newReminderDate,
                false,
                basePayload.newReminderNote,
                1, // count + 1
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
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
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'no_answer',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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

            // Should complete reminder, create new reminder (count+1), update client last contact
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'call',
                'followup',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                false,
                basePayload.newReminderNote,
                1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientLastContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(mockConnection.commit).toHaveBeenCalled();
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
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'text',
                'waiting',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                false,
                basePayload.newReminderNote,
                1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(mockConnection.commit).toHaveBeenCalled();
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
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'email',
                'waiting',
                1,
                basePayload.userId,
                mockConnection
            );
            expect(mockConnection.commit).toHaveBeenCalled();
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(reminderModels.createReminder).toHaveBeenCalledWith(
                mockGetAttemptId,
                basePayload.newReminderDate,
                false,
                basePayload.newReminderNote,
                1,
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
        });
    });

    describe('ignore + none scenarios', () => {
        test('ignore + none + moveToNextCycle=false + createNewReminder=false', async () => {
            await service.completeReminder({
                ...basePayload,
                reminderCount: 1,
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
                1,
                basePayload.userId,
                mockConnection
            );
            expect(attemptModels.abandonAttempt).toHaveBeenCalledWith(mockGetAttemptId, basePayload.userId, mockConnection);
            expect(clientModels.updateClientLastContact).not.toHaveBeenCalled();
            expect(attemptModels.setFirstReminderSentAt).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
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
            expect(reminderModels.completeReminder).toHaveBeenCalledWith(
                basePayload.reminderId,
                'ignored',
                'none',
                0,
                basePayload.userId,
                mockConnection
            );
            expect(clientModels.updateClientLastContact).not.toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
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

        test('should always update nextFollowUp client field', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'text',
                outcome: 'waiting',
                moveToNextCycle: false,
                createNewReminder: false
            });

            expect(clientModels.updateClientNextContact).toHaveBeenCalledWith(
                basePayload.clientId,
                basePayload.userId,
                mockConnection
            );
        });

        test('should rollback transaction on error', async () => {
            reminderModels.getAttemptIdFromReminder.mockRejectedValue(new Error('Database error'));

            await expect(service.completeReminder({
                ...basePayload
            })).rejects.toThrow('Database error');

            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        test('should release connection after successful commit', async () => {
            await service.completeReminder({
                ...basePayload,
                method: 'call',
                outcome: 'booked',
                moveToNextCycle: false,
                createNewReminder: false
            });

            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });
});

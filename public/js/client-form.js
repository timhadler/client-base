$(document).ready(function() {
    
    // Toggle address fields when checkbox is clicked
    $('#addressCheckboxWrapper').on('click', function() {
        const checkbox = $('#hasAddress');
        const isChecked = checkbox.prop('checked');
        const addressFields = $('#addressFields');
        
        if (isChecked) {
            addressFields.addClass('show');
            // Make required fields required when visible
            $('#addressLine1, #city, #state, #postcode').prop('required', true);
        } else {
            addressFields.removeClass('show');
            // Remove required attribute and clear values
            $('#addressFields input, #addressFields select').each(function() {
                $(this).prop('required', false).val('');
            });
        }
    });
    
    // Show/hide reminder date field based on radio selection
    $('input[name="setReminder"]').on('change', function() {
        const reminderDateGroup = $('#reminderDateGroup');
        const reminderDate = $('#reminderDate');
        
        if ($(this).val() === 'yes') {
            reminderDateGroup.slideDown(300);
            reminderDate.prop('required', true);
        } else {
            reminderDateGroup.slideUp(300);
            reminderDate.prop('required', false);
        }
    });
    
    // Set minimum date to today for reminder date
    const today = new Date().toISOString().split('T')[0];
    $('#reminderDate').attr('min', today);
    
    // Form validation and submission
    $('#clientForm').on('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = $('#submitBtn');
        const originalText = submitBtn.html();
        
        // Disable submit button and show loading state
        submitBtn.prop('disabled', true)
                 .html('<span>⏳</span> Saving...');
        
        // Get form data
        const formData = $(this).serialize();
        const formAction = $(this).attr('action');
        const formMethod = $(this).attr('method');
        
        // Submit form via AJAX
        $.ajax({
            url: formAction,
            method: formMethod,
            data: formData,
            success: function(response) {
                // Show success message
                showNotification('Client saved successfully!', 'success');
                
                // Redirect after short delay
                setTimeout(function() {
                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    } else {
                        window.location.href = '/clients';
                    }
                }, 1000);
            },
            error: function(xhr) {
                // Re-enable submit button
                submitBtn.prop('disabled', false).html(originalText);
                
                // Show error message
                let errorMessage = 'Failed to save client. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                showNotification(errorMessage, 'error');
            }
        });
    });
    
    // Email validation
    $('#email').on('blur', function() {
        const email = $(this).val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            $(this).addClass('cf-input-error');
            showFieldError($(this), 'Please enter a valid email address');
        } else {
            $(this).removeClass('cf-input-error');
            removeFieldError($(this));
        }
    });
    
    // Phone number formatting (optional)
    $('#phone').on('blur', function() {
        let phone = $(this).val().trim();
        if (phone) {
            // Remove all non-digit characters except + at the start
            phone = phone.replace(/[^\d+]/g, '');
            if (phone && !phone.startsWith('+')) {
                phone = '+' + phone;
            }
            $(this).val(phone);
        }
    });
    
    // Auto-capitalize first and last names
    $('#firstName, #lastName').on('blur', function() {
        const value = $(this).val();
        if (value) {
            $(this).val(value.charAt(0).toUpperCase() + value.slice(1));
        }
    });
    
    // Helper function to show notifications
    function showNotification(message, type) {
        // Remove any existing notifications
        $('.cf-notification').remove();
        
        const notification = $('<div>')
            .addClass('cf-notification')
            .addClass('cf-notification-' + type)
            .text(message);
        
        $('body').append(notification);
        
        // Show notification with animation
        setTimeout(() => notification.addClass('show'), 10);
        
        // Hide and remove after 5 seconds
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Helper function to show field-specific errors
    function showFieldError($field, message) {
        removeFieldError($field);
        
        const error = $('<div>')
            .addClass('cf-field-error')
            .text(message);
        
        $field.after(error);
    }
    
    // Helper function to remove field errors
    function removeFieldError($field) {
        $field.next('.cf-field-error').remove();
    }
    
    // Prevent accidental navigation away from unsaved form
    let formModified = false;
    
    $('#clientForm input, #clientForm select, #clientForm textarea').on('change', function() {
        formModified = true;
    });
    
    $('#clientForm').on('submit', function() {
        formModified = false;
    });
    
    $(window).on('beforeunload', function(e) {
        if (formModified) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    });
    
    // Handle cancel button to disable unsaved changes warning
    $('.cf-btn-secondary').on('click', function() {
        formModified = false;
    });
});
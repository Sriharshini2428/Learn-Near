document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const phoneInput = document.getElementById('phone');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpGroup = document.getElementById('otp-group');
    const otpInput = document.getElementById('otp');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpStatus = document.getElementById('otp-status');
    const submitBtn = document.getElementById('submitBtn');
    const qualificationSelect = document.getElementById('qualification');
    const educationalDetailsFieldset = document.getElementById('educationalDetails');

    // New elements for conditional display
    const academicRadio = document.getElementById('field-academic');
    const artsRadio = document.getElementById('field-arts');
    const academicOptions = document.getElementById('academic-options');
    const artsOptions = document.getElementById('arts-options');
    // Note: We don't use querySelectorAll for required fields here, instead we manage 'required' attributes directly in toggleFormSections
    const certificateInput = document.getElementById('certificate');
    
    let isOtpVerified = false;
    let simulatedOtp = '';

    // --- Conditional Display Logic ---

    function toggleFormSections(field) {
        // Reset required state for all conditional fields first
        qualificationSelect.required = false;
        certificateInput.required = false;
        document.querySelectorAll('#academic-options input[type="checkbox"]').forEach(el => el.required = false);
        document.querySelectorAll('#arts-options input[type="checkbox"]').forEach(el => el.required = false);


        if (field === 'academic') {
            academicOptions.style.display = 'block';
            artsOptions.style.display = 'none';
            educationalDetailsFieldset.style.display = 'block';

            // Set Academic fields as required
            qualificationSelect.required = true;
            certificateInput.required = true;
            
            // Enable certificate input for submission
            certificateInput.disabled = false;
            
        } else if (field === 'arts') {
            academicOptions.style.display = 'none';
            artsOptions.style.display = 'block';
            // User requested: "when u press on arts there is no need of educational details"
            educationalDetailsFieldset.style.display = 'none'; 
            
            // Disable certificate input completely
            certificateInput.disabled = true;
            
            // Note: We don't enforce required status on every single arts checkbox,
            // instead, we validate that AT LEAST ONE is checked during form submission.
        }
    }

    // Initial state check (Academic is checked by default in HTML)
    toggleFormSections(academicRadio.checked ? 'academic' : 'arts');

    // Listener for primary field choice
    academicRadio.addEventListener('change', () => toggleFormSections('academic'));
    artsRadio.addEventListener('change', () => toggleFormSections('arts'));


    // --- Core Form Validation and Constraints ---

    // 1. Qualification Check Constraint (Only matters if Academic is selected)
    qualificationSelect.addEventListener('change', () => {
        if (qualificationSelect.value === "" && academicRadio.checked) {
            qualificationSelect.setCustomValidity("Please select your highest qualification.");
        } else {
            qualificationSelect.setCustomValidity("");
        }
    });

    // 2. Simulated OTP Sending Logic
    sendOtpBtn.addEventListener('click', () => {
        if (phoneInput.checkValidity() && phoneInput.value.length === 10) {
            // Simulate sending an OTP
            simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[SIMULATED BACKEND]: OTP sent to ${phoneInput.value}: ${simulatedOtp}`);
            
            otpGroup.style.display = 'block';
            otpStatus.textContent = 'OTP sent! Check your simulated message (see console).';
            otpStatus.style.color = 'orange';
            sendOtpBtn.disabled = true;
            phoneInput.disabled = true;
        } else {
            showStatusMessage('Please enter a valid 10-digit phone number first.', 'error');
            phoneInput.focus();
        }
    });

    // 3. OTP Verification Logic
    verifyOtpBtn.addEventListener('click', () => {
        if (otpInput.value === simulatedOtp && otpInput.value.length === 6) {
            isOtpVerified = true;
            otpStatus.textContent = 'Verification Successful!';
            otpStatus.style.color = 'green';
            verifyOtpBtn.disabled = true;
            otpInput.disabled = true;
            submitBtn.disabled = false; // Enable final submission
            showStatusMessage('OTP Verified. You can now submit your application.', 'success');
        } else {
            isOtpVerified = false;
            otpStatus.textContent = 'Invalid OTP. Please try again.';
            otpStatus.style.color = 'red';
            submitBtn.disabled = true;
            showStatusMessage('Invalid OTP.', 'error');
        }
    });

    // 4. Final Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!isOtpVerified) {
             showStatusMessage('Please verify your phone number via OTP before submitting.', 'error');
            return;
        }

        // --- Collect Data and Final Conditional Validation ---
        const formData = new FormData(form);
        const data = {};
        const fieldOfInterest = formData.get('field_of_interest');
        data['field_of_interest'] = fieldOfInterest;

        // Collect personal and contact data
        data['name'] = formData.get('name');
        data['age'] = formData.get('age');
        data['gender'] = formData.get('gender');
        data['phone'] = formData.get('phone');
        data['aadhar'] = formData.get('aadhar');

        // Collect conditional data
        if (fieldOfInterest === 'academic') {
            data['qualification'] = formData.get('qualification');
            data['certificate_name'] = formData.get('certificate').name || 'No file uploaded';
            
            // Collect selected academic classes
            const selectedClasses = Array.from(document.querySelectorAll('#academic-options input[name="classes_to_teach"]:checked'))
                .map(cb => cb.value);
            data['classes_to_teach'] = selectedClasses;
            
             if (selectedClasses.length === 0) {
                 showStatusMessage('Please select at least one Academic Class to teach.', 'error');
                 return;
            }

        } else if (fieldOfInterest === 'arts') {
             // Collect selected arts specialties
            const selectedMusic = Array.from(document.querySelectorAll('#arts-options input[name="arts_music"]:checked'))
                .map(cb => cb.value);
            const selectedDance = Array.from(document.querySelectorAll('#arts-options input[name="arts_dance"]:checked'))
                .map(cb => cb.value);
            
            data['arts_music_specialties'] = selectedMusic;
            data['arts_dance_specialties'] = selectedDance;
            
            // Ensure at least one arts specialty is selected for submission
            if (selectedMusic.length === 0 && selectedDance.length === 0) {
                 showStatusMessage('Please select at least one Music or Dance specialty in the Arts Details section.', 'error');
                 return;
            }
        }

        console.log("--- FORM SUBMITTED ---");
        console.log(JSON.stringify(data, null, 2));

        showStatusMessage('Application submitted successfully! See console for data.', 'success');
        form.reset();
        
        // Reset state
        isOtpVerified = false;
        simulatedOtp = '';
        submitBtn.disabled = true;
        sendOtpBtn.disabled = false;
        phoneInput.disabled = false;
        otpGroup.style.display = 'none';
        
        // Re-apply initial section toggle (Academic by default)
        academicRadio.checked = true;
        toggleFormSections('academic');
    });
    
    // Custom message box function (replacing alert())
    function showStatusMessage(message, type) {
        const existingMsg = document.querySelector('#form-message-box');
        if (existingMsg) existingMsg.remove();

        const msgBox = document.createElement('div');
        msgBox.id = 'form-message-box';
        msgBox.textContent = message;
        msgBox.style.padding = '10px';
        msgBox.style.borderRadius = '4px';
        msgBox.style.marginTop = '15px';
        msgBox.style.textAlign = 'center';
        msgBox.style.fontWeight = 'bold';
        msgBox.style.transition = 'opacity 0.5s ease-out';
        msgBox.style.opacity = '1';


        if (type === 'success') {
            msgBox.style.backgroundColor = '#d4edda';
            msgBox.style.color = '#155724';
        } else if (type === 'error') {
            msgBox.style.backgroundColor = '#f8d7da';
            msgBox.style.color = '#721c24';
        } else {
            msgBox.style.backgroundColor = '#fff3cd';
            msgBox.style.color = '#856404';
        }

        form.prepend(msgBox);

        // Auto-hide the message after 5 seconds
        setTimeout(() => {
            msgBox.style.opacity = '0';
            setTimeout(() => msgBox.remove(), 500); // Remove after transition
        }, 5000);
    }
});

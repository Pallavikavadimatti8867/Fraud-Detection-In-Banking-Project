// SentraBank FraudShield AI - Interactive Client Scripts

document.addEventListener('DOMContentLoaded', function () {
    // Password toggle visibility
    const toggleBtn = document.getElementById('togglePassword');
    const pwdInput = document.getElementById('password');
    const pwdIcon = document.getElementById('togglePasswordIcon');

    if (toggleBtn && pwdInput && pwdIcon) {
        toggleBtn.addEventListener('click', function () {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                pwdIcon.classList.remove('bi-eye');
                pwdIcon.classList.add('bi-eye-slash');
            } else {
                pwdInput.type = 'password';
                pwdIcon.classList.remove('bi-eye-slash');
                pwdIcon.classList.add('bi-eye');
            }
        });
    }

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            try {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            } catch (e) {
                // ignore if already closed
            }
        }, 5000);
    });
});

const vendorRegistartionForm = document.querySelector('#registerVendor-form');
const vendorSubmitBtn = document.querySelector('#registerVendor-btn');


vendorSubmitBtn.addEventListener('click', (event) => {
    //Wait with submitting to server
    event.preventDefault(); 

    let errorMessage = validateVendorForm();

    if(errorMessage === ''){
        vendorRegistartionForm.submit();
    }
    else{
        alert(errorMessage);
    }
});

function validateVendorForm() {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const businessName = document.querySelector('#business-name').value;
    const businessAddress = document.querySelector('#business-address').value;
    
    let errorMessage = "";
    errorMessage += validateUsername(username);
    errorMessage += validatePassword(password);
    errorMessage += validateField(businessName, "Business name");
    errorMessage += validateField(businessAddress, "Business address");
    return errorMessage;
}

const validateUsername = (username) => {
    //Save constraints
    const constraints = /^[a-zA-Z0-9]+$/;
    //Validate syntax
    console.log(username);
    if(!constraints.test(username)){
        return "Username can only contain letters and digits\n";
    }
    //Validate lenght
    if(username.length < 8 || username.length > 15){
        return "Username must be between 8 and 15 characters long\n";
  }
  return "";
}

const validatePassword = (password) => {
    // Validate at least one upper case letter
    const uppercase = /[A-Z]/;
    if (!uppercase.test(password)) {
      return "Password must contain at least one uppercase letter\n";
    }
    // Validate at least one lower case letter
    const lowercase = /[a-z]/;
    if (!lowercase.test(password)) {
      return "Password must contain at least one lowercase letter\n";
    }
    // Validate at least one digit
    const digit = /[0-9]/;
    if (!digit.test(password)) {
      return "Password must contain at least one digit\n";
    }
    // Validate at least one special character
    const specialCharRegex = /[!@#$%^&*]/;
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)\n";
    }
    // Validate a length from 8 to 20 characters
    if (password.length < 8 || password.length > 20) {
      return "Password must be between 8 and 20 characters long\n";
    }
    return "";
  }

  const validateField = (fieldValue, fieldName) => {
    // Validate fieldValue is not null or undefined
    if (!fieldValue) {
      return `${fieldName} is required\n`;
    }
    // Validate fieldValue has a minimum length of 5 characters
    if (fieldValue.length < 5) {
      return `${fieldName} must be at least 5 characters long\n`;
    }
    return "";
  }

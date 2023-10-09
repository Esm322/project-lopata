const form = document.getElementById('form');
const formErrorTextarea = document.getElementById('user-create-form-error-textarea');
const formErrorEmail = document.getElementById('user-create-form-error-email');
const formErrorPhone = document.getElementById('user-create-form-error-phone');
const contactTitle = document.getElementById('contact-title');
const formLabelEmail = document.getElementById('label-input-email');
const formLabelPhone = document.getElementById('label-input-phone');
const formLabelTextarea = document.getElementById('label-input-textarea');
const inputPhone = document.getElementById('input-phone');
const formBtn = document.getElementById('form-btn');

async function postMessage(data) {
  const errors = [];

  if (!data.email.trim()) {
    errors.push({
      name: 'email',
      message: 'E-mail обязателен для заполнения'
    })
  } else if (!data.email.includes('@') || !data.email.includes('.')) {
    errors.push({
      name:'email',
      message: 'E-mail имеет неверный формат, должен содержать "@" и "."'
    })
  }

  if (!data.phone.trim()) {
    errors.push({
      name: 'phone',
      message: 'Номер телефона обязателен для заполнения'
    })
  } else if (!data.phone.startsWith('+') || data.phone.length !== 12) {
    errors.push({
      name: 'phone',
      message: 'Номер телефона имеет неверный формат, должен состоять из 11 символов и начинаться с "+"'
    })
  }

  if (!data.textarea) {
    errors.push({
      name: 'textarea',
      message: 'Необходимо заполнить поле'
    })
  }

  const response = await fetch('https://gorest.co.in/public/v2/users', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer f49d2f639b3cc7f2b9f1378344fea50e919778930558eccf7f2165d243bc1fe1',
        }
  }).then(res => res.json())

  if (response.code === 200 || response.code === 201) {
    return response.data;
  }

  if (response.data) {
      const err = new TypeError();
      err.errorMessages = response.data.map(err => ({
          name: err.field,
          message: err.message,
      }))
      throw err;
  }

  if (errors.length) {
    const err = new TypeError();
    err.errorMessages = errors;

    throw err;
  }

  throw new Error('Не удалось отправить письмо');
}

inputPhone.addEventListener('input', () => {
  inputPhone.value = inputPhone.value.replace(/[^0-9\+]/g, '')
})

form.addEventListener('submit', async (el) => {
  el.preventDefault();

  const data = {};
  const inputs = {};
  const spinner = document.querySelector('button .submit-spinner')

  for (let i = 0; i < form.elements.length; ++i) {
    const input = form.elements[i];

    if (!input.name) {
      continue
    }

    data[input.name] = input.value;
    inputs[input.name] = input;
    input.classList.remove('is-invalid');
    contactTitle.classList.remove('contacts__title--active');
    formLabelEmail.classList.remove('form__label--active');
    formLabelPhone.classList.remove('form__label--active');
    spinner.classList.remove('submit-spinner_hide');
    formErrorTextarea.textContent = '';
    formErrorEmail.textContent = '';
    formErrorPhone.textContent = '';
  }

  try {
    spinner.style.display = 'inline-block';
    formBtn.disabled = true;
    await postMessage(data);
  } catch (err) {
    if (err.name !== 'TypeError') {
      throw err
    }
    if (err.errorMessages) {
      for (const errorMessage of err.errorMessages) {
        inputs[errorMessage.name].classList.add('is-invalid');
      }

      if (err.errorMessages)
      err.errorMessages.map(errorMessage => {
        if (errorMessage.name === 'email') {
          formErrorEmail.textContent = errorMessage.message;
          contactTitle.classList.add('contacts__title--active');
        }

        if (errorMessage.name === 'phone') {
          formErrorPhone.textContent = errorMessage.message;
          formLabelEmail.classList.add('form__label--active');
        }

        if (errorMessage.name === 'textarea') {
          formErrorTextarea.textContent = errorMessage.message;
          formLabelPhone.classList.add('form__label--active');
        }
      }).join('.')

    }
  } finally {
    spinner.style.display = 'none'
    formBtn.disabled = false;
  }
})
// formBtn.disabled = true;

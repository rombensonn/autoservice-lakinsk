(function () {
  const form = document.querySelector('[data-lead-form]');
  const status = document.querySelector('[data-form-status]');

  if (!form || !status) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const initialButtonText = submitButton ? submitButton.textContent : '';

  function setStatus(message, type) {
    status.textContent = message;
    status.className = 'form-status form-status--' + type;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (form.dataset.staticForm === 'true') {
      setStatus('Это статическая версия для просмотра на GitHub Pages. Для заявки позвоните или напишите во ВКонтакте.', 'info');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем заявку...';
    }

    setStatus('Проверяем данные и отправляем заявку.', 'info');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Заявка не отправилась. Попробуйте еще раз.');
      }

      form.reset();
      setStatus('Заявка отправлена. Мастер свяжется с вами по указанному телефону.', 'success');
    } catch (error) {
      setStatus(error.message || 'Что-то пошло не так. Позвоните нам напрямую.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = initialButtonText;
      }
    }
  });
})();

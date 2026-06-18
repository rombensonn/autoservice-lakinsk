(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const form = document.querySelector("[data-lead-form]");
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (header) {
    const setHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      if (!form) return;
      const service = link.getAttribute("data-service");
      const select = form.querySelector("select[name='service']");
      if (service && select instanceof HTMLSelectElement) {
        select.value = service;
      }
    });
  });

  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const requiredFields = Array.from(form.querySelectorAll("[required]"));

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.className = "form-status";
    if (type) status.classList.add(`is-${type}`);
  };

  const setInvalid = (field, invalid) => {
    field.classList.toggle("is-invalid", invalid);
    if (field.type === "checkbox") {
      field.closest(".checkbox-row")?.classList.toggle("is-invalid", invalid);
    }
  };

  const validate = () => {
    let isValid = true;
    requiredFields.forEach((field) => {
      const invalid = field.type === "checkbox" ? !field.checked : !field.value.trim();
      setInvalid(field, invalid);
      if (invalid) isValid = false;
    });

    const phone = form.querySelector("input[name='phone']");
    if (phone instanceof HTMLInputElement) {
      const digits = phone.value.replace(/\D/g, "");
      const invalidPhone = digits.length < 10 || digits.length > 12;
      setInvalid(phone, invalidPhone);
      if (invalidPhone) isValid = false;
    }

    return isValid;
  };

  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement) {
      setInvalid(target, false);
    }
    setStatus("");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) {
      setStatus("Заполните обязательные поля: телефон, услугу и описание задачи.", "error");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button instanceof HTMLButtonElement) {
      button.disabled = true;
      button.textContent = "Отправляем задачу...";
    }
    setStatus("Отправляем задачу мастеру...");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus(data.message || "Не удалось отправить описание. Проверьте поля или позвоните по телефону.", "error");
        if (data.errors) {
          Object.keys(data.errors).forEach((name) => {
            const field = form.querySelector(`[name="${CSS.escape(name)}"]`);
            if (field instanceof HTMLElement) setInvalid(field, true);
          });
        }
        return;
      }

      form.reset();
      setStatus(data.message || "Заявка отправлена. Мастер свяжется с вами для уточнения времени и деталей.", "success");
    } catch (error) {
      setStatus("Не удалось отправить описание. Позвоните по телефону +7 (920) 621-75-75.", "error");
    } finally {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
        button.textContent = "Отправить задачу мастеру";
      }
    }
  });
})();

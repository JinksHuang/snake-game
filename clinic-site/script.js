document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const service = formData.get('service');

    const confirmation = document.createElement('div');
    confirmation.className = 'toast';
    confirmation.innerHTML = `<strong>预约提交成功</strong><p>${name || '尊敬的客户'}，您的 ${service} 需求已收到，我们会尽快与您联系确认。</p>`;

    document.body.appendChild(confirmation);
    setTimeout(() => confirmation.classList.add('visible'), 20);
    setTimeout(() => {
      confirmation.classList.remove('visible');
      setTimeout(() => confirmation.remove(), 300);
    }, 3200);

    form.reset();
  });
});

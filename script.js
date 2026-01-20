function toggleMenu(button) {
    const submenu = button.nextElementSibling;
    const chevron = button.querySelector('.chevron');
    submenu.classList.toggle('hidden');
    chevron.textContent = submenu.classList.contains('hidden') ? '▸' : '▾';
}

function showContent(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
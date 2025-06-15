document.getElementById('toggleExpand').addEventListener('click', () => {
  const extraNav = document.getElementById('extraNav');
  const toggle = document.getElementById('toggleExpand');

  if (extraNav.classList.contains('hidden')) {
    extraNav.classList.remove('hidden');
    toggle.querySelector('span').textContent = '🔽';
  } else {
    extraNav.classList.add('hidden');
    toggle.querySelector('span').textContent = '🔼';
  }
});

function navigateTo(page) {
  window.location.href = page;
}
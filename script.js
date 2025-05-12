document.getElementById('openLetter').addEventListener('click', () => {
  document.querySelector('.card').classList.add('hidden');
  document.querySelector('.letter').classList.remove('hidden');
});

document.getElementById('closeLetter').addEventListener('click', () => {
  document.querySelector('.letter').classList.add('hidden');
  document.querySelector('.card').classList.remove('hidden');
});
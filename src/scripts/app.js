$(function() {
  // attach event
  $('.js-select').change(function() {
    const currentSpeaker = $(this).data('currentSpeaker');
    const newSpeaker = $(this).val();
    const currentPath = window.location.pathname;

    window.location.pathname = currentPath.replace(currentSpeaker, newSpeaker);
  });
});

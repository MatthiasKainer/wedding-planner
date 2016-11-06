$('#editUser').on('show.bs.modal', function (event) {
  var tableRow = $(event.relatedTarget) // Button that triggered the modal
  var fields = ["name", "people", "coming", "code", "hotelRequired", "hotelRange"];
  var modal = $(this);
  
  fields.forEach(function(field) {
      var load = tableRow.data('value-' + field.toLocaleLowerCase());
      if (modal.find("[data-edit=" + field + "]").attr("type") === "checkbox")
        modal.find("[data-edit=" + field + "]")[0].checked = load === true;
      else
        modal.find("[data-edit=" + field + "]").val(load);
      modal.find("[data-label=" + field + "]").text(load);
  });
});

$(document).on("click", "[data-fire]", function() {
    $($(this).data("fire")).submit();
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if (getParameterByName("saved")) {
    $('[data-element="table"]').scrollTop($('[data-element="table"]')[0].scrollHeight);
    $('[data-element="table"] table tr:last').click();
}
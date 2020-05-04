$(".ui.dropdown").dropdown({
    allowCategorySelection: true,
    transition: "fade up",
    on: "hover"
});

$('.ui.accordion').accordion();

$(".openbtn").on("click", function () {
    $(".ui.sidebar").toggleClass("very thin icon");
    $(".asd").toggleClass("marginlefting");
    $(".sidebar z").toggleClass("displaynone");
    $(".ui.accordion").toggleClass("displaynone");
    $(".ui.dropdown.item").toggleClass("displayblock");

    $(".logo").find('img').toggle();
});
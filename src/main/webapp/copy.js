document.addEventListener("DOMContentLoaded", function () {
    const showPopupButton = document.getElementById("show-popup");
    const popupContainer = document.getElementById("popup-container");
    const closePopupButton = document.getElementById("close-popup");

    showPopupButton.addEventListener("click", function () {
        popupContainer.style.display = "block";
        setTimeout(function () {
            popupContainer.style.height = "100%";
        }, 10); // Add a small delay for the animation to work
    });

    closePopupButton.addEventListener("click", function () {
        popupContainer.style.height = "0";
        setTimeout(function () {
            popupContainer.style.display = "none";
        }, 300); // Close the popup after the animation
    });
});

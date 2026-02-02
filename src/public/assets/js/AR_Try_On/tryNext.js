let selectedShirt = null;

document.querySelectorAll('.selectable-shirt').forEach(img => {
    img.addEventListener('click', function () {
        selectedShirt = this.dataset.shirt;

        console.log('Selected shirt:', selectedShirt);

        // Example: apply to preview image
        // document.getElementById('shirtPreview').src = this.src;

        // Close modal
        const modal = bootstrap.Modal.getInstance(
            document.getElementById('shirtModal')
        );
        modal.hide();
    });
});

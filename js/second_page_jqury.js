$(document).ready(function () {
    var $leftSidebar = $('#left_side_slider');
    var $chatPopup = $('#chatPopup');
    var $chatBackdrop = $('#chatbutton');

    // Function to toggle left sidebar
    function toggleLeftSidebar() {
        if ($leftSidebar.hasClass('show')) {
            $leftSidebar.removeClass('show');
            $('.push-content').removeClass('pushed_left');
        } else {
            $leftSidebar.addClass('show');
            $('.push-content').addClass('pushed_left');
        }
    }

    // Toggle left sidebar visibility on icon click
    $('#toggleLeftSidebar').click(function () {
        toggleLeftSidebar();
    });

    // Toggle chat popup
    $('#chatbutton').click(function () {
        $chatPopup.show();
        $chatBackdrop.hide();
    });

    // Close chat popup
    $('#closeButton').click(function () {
        $chatPopup.hide();
        $chatBackdrop.show();
    });

    // Close sidebars and chat popup when clicking outside
    $(document).click(function (e) {
        if (!$(e.target).closest('#left_side_slider').length && !$(e.target).is('#toggleLeftSidebar')) {
            if ($leftSidebar.hasClass('show')) {
                toggleLeftSidebar();
            }
        }
        if (!$(e.target).closest('.popup').length && !$(e.target).is('#chatbutton')) {
            $chatPopup.hide();
            $chatBackdrop.show();
        }
    });

    // Dark mode
    $('#light-mode').click(function () {
        $('body').removeClass('dark-mode');
    });

    $('#dark-mode').click(function () {
        $('body').addClass('dark-mode');
    });
});

$(document).ready(function () {
    var $leftSidebar = $('#left_side_slider');
    var $rightSidebar = $('#right_side_slider');

    // Function to toggle left sidebar
    function toggleLeftSidebar() {
        if ($leftSidebar.hasClass('show')) {
            $leftSidebar.removeClass('show');
            $('.push-content').removeClass('pushed_left');
            $('#toggleLeftSidebar').html('L');
        } else {
            $leftSidebar.addClass('show');
            $('.push-content').addClass('pushed_left');
            $('#toggleLeftSidebar').html('L');
        }
    }

    // Function to toggle right sidebar
    function toggleRightSidebar() {
        if ($rightSidebar.hasClass('show')) {
            $rightSidebar.removeClass('show');
            $('.push-content').removeClass('pushed_right');
            $('#toggleRightSidebar').html('R');
        } else {
            $rightSidebar.addClass('show');
            $('.push-content').addClass('pushed_right');
            $('#toggleRightSidebar').html('R');
        }
    }

    // Toggle left sidebar visibility on icon click
    $('#toggleLeftSidebar').click(function () {
        toggleLeftSidebar();
    });

    // Toggle right sidebar visibility on icon click
    $('#toggleRightSidebar').click(function () {
        toggleRightSidebar();
    });

    // Close sidebars when clicking outside
    $(document).click(function (e) {
        if (!$(e.target).closest('#left_side_slider').length && !$(e.target).is('#toggleLeftSidebar')) {
            if ($leftSidebar.hasClass('show')) {
                toggleLeftSidebar();
            }
        }
        if (!$(e.target).closest('#right_side_slider').length && !$(e.target).is('#toggleRightSidebar')) {
            if ($rightSidebar.hasClass('show')) {
                toggleRightSidebar();
            }
        }
    });
});




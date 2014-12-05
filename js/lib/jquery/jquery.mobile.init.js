// to prevent flickering and for some performance issues
$(document).bind("mobileinit", function()
{
    if (navigator.userAgent.indexOf("Android") != -1)
    {
        $.mobile.defaultPageTransition = 'none';
        $.mobile.defaultDialogTransition = 'none';
        $.mobile.transitionFallbacks.slideout = "none"
    }
});

async function start() {
    // writeDropdownButton('All')
    // writeDropwdownList()
    info(777.947581228551, 77.1260190889041)
    sprinkle(1.285433651481735)
    mapTotal(-97.36047502716632, 37.68260895834942)
    mapRelative(-97.36047502716632, 37.68260895834942)
    profile(777.947581228551)
    // 777.947581228551 × 7 = 5,445.6330686
}


(function () {
    window.onload = function () {
        start();
        const preloader = document.querySelector('.page-loading');
        preloader.classList.remove('active');
        setTimeout(function () {
            preloader.remove();
        }, 1000);
    };
})();
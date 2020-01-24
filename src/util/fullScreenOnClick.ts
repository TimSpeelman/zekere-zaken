
export function fullScreen() {
    var docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    }
    // @ts-ignore
    else if (docElm.mozRequestFullScreen) {
        // @ts-ignore
        docElm.mozRequestFullScreen();
    }
    // @ts-ignore
    else if (docElm.webkitRequestFullScreen) {
        // @ts-ignore
        docElm.webkitRequestFullScreen();
    }
    // @ts-ignore
    else if (docElm.msRequestFullscreen) {
        // @ts-ignore
        docElm.msRequestFullscreen();
    }
}

export function fullScreenOnClick() {
    document.addEventListener("click", function () {
        fullScreen();
    })
}

function main() {
    var igniteEl = document.getElementById('ignite');
    igniteEl.addEventListener('click', function(e) {
        e.preventDefault();
        ga('send', 'event', 'data', 'click', 'ignite');
    });
}


main();

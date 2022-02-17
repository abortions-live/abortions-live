async function info(repeat_rate, per_min) {
    var countMin = document.getElementById('infoCountMinute')
    countMin.innerHTML = per_min.toFixed(0);

    var count = document.getElementById('infoCountUp')
    count.innerHTML = 0

    var countWho = document.getElementById('infoCountUpWho')
    countWho.innerHTML = 0

    var intervalID = setInterval(tick, repeat_rate);
    function tick(){
        var value = parseInt(count.textContent)
        var plusOne = value + 1
        count.innerHTML = plusOne;
    }

    var repeatRateWho = repeat_rate/3
    var intervalIDWho = setInterval(tickWho, repeatRateWho);
    function tickWho(){
        var value = parseInt(countWho.textContent)
        var plusOne = value + 1
        countWho.innerHTML = plusOne;
    }

}

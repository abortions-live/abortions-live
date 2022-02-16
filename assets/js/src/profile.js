// {greeting}, my name would have been {name}.
// I would have been born and raised in {rural/urban} {nation}
// with 2 {adjective} parents and {n} siblings.
// At {n} I would have {gotten married and} began a beautiful family of my own
// with my beloved {hus/wife} {name}. 

// I would have lived to see {n} wonderful years on this beutiful planet had I not been aborted at {n} weeks old.

async function random(data) {
    let total = 0;
    for (let i = 0; i < data.length; ++i) {
        total += data[i][1];
    }
    const threshold = Math.random() * total;
    total = 0
    for (let i = 0; i < data.length - 1; ++i) {
        total += data[i][1];
        if (total >= threshold) {
            return data[i][0];
        }
    }
    return data[data.length - 1][0];
}

async function randomIntFromFloat(float) {
    var high = Math.ceil(float)
    var highChance = high - float
    var low = Math.floor(float)
    var lowChance = float - low
    var chances = [
        [high, highChance],
        [low, lowChance]
    ]
    var int = random(chances)
    return int
}

async function randomIndustry(nation) {

    var industry = await fetch(`assets/json/industry.json`) 
    industry = await industry.json()
    industry = industry[nation]
    industry = industry[Math.floor(Math.random() * industry.length)];
    return industry

}

async function childExpectancy(nation) {
    // TODO: Generate ints in range with set mean and SD then select. 
    // https://stackoverflow.com/questions/22619719/javascript-generate-random-numbers-with-fixed-mean-and-standard-deviation
    try {
        var children = await fetch(`assets/json/children.json`) 
        children = await children.json()
        children = await children[nation]
        return randomIntFromFloat(children)
    } catch {
        // https://ourworldindata.org/fertility-rate
        return randomIntFromFloat(2.5)
    }
}

async function lifeExpectancy(nation, sex) {
    // TODO: Generate ints in range with set mean and SD then select. 
    // https://stackoverflow.com/questions/22619719/javascript-generate-random-numbers-with-fixed-mean-and-standard-deviation
    try {
        var expect = await fetch(`assets/json/lifeExpect.json`) 
        expect = await expect.json()
        expect = await expect[nation][sex]
        return randomIntFromFloat(expect)
    } catch {
        // https://www.macrotrends.net/countries/WLD/world/life-expectancy (2022 Anno Domini Febuary 12 17:39 CST)
        return randomIntFromFloat(72.98)
    }
}

async function randomPic(nation, sex) {

    var response = await fetch(`assets/json/race-iso.json`) 
    var raceIso = await response.json()
    nation = nation.toString()
    var race = await raceIso[nation]
    var dir = `a${race}${sex}`
    var i = Math.floor(Math.random() * (539) + 1)
    var path = `assets/img/faces/${dir}/${i}.jpg`
    return path

}

async function randomSpouse(nation, sex) {

    try {
        var response = await fetch(`assets/json/names/${nation}.json`) 
        var names = await response.json()
        if (sex === 'm') {
            sex = 'f'
        }
        else {
            sex = 'm'
        }
        var firstOptions = await names[sex]
        var first = await random(firstOptions)
        // The space below is important - dont remove it.
        var name = ` ${first}`
        return name        
    } catch {
        return ''
    }

}

async function randomName(nation, sex) {

    try {
        var response = await fetch(`assets/json/names/${nation}.json`) 
        var names = await response.json()
        var firstOptions = await names[sex]
        var first = await random(firstOptions)
        var lastOptions = await names['l']
        var last = await random(lastOptions)
        var name = `${first} ${last}`
        return name        
    } catch {
        return 'Unknown Name'
    }

}

async function randomGreeting(language) {

    try {

        var hello = await fetch(`assets/json/hello.json`) 
        hello = await hello.json()
        for (let i = 0; i < hello.length; i++) {
            var dict = hello[i]
            var lang = dict['language']
            if (lang === language) {
                return dict['hello']
            }
        }
        return 'Hello!'
    } catch {
        return 'Hello!'
    }

}


async function randomLanguage(nation) {

    try {
        var langs = await fetch(`assets/json/langs.json`) 
        langs = await langs.json()
        var natLangs = langs[nation]
        if (natLangs.length) {
            var lang = await random(natLangs)
            return lang
        } else {
            return 'English'
        }

    } catch {
        return 'English' // Used as the Lingua Franca. Ha ha. What a relic of an expression.
    }

}

async function randomNation() {

    var response = await fetch("assets/json/world.json") 
    var world = await response.json()
    var options = world['cnt']

    var resp = random(options)
    return resp
}

async function randomSex() {
    var options = [
        ['m', 50],
        ['f', 50],
    ]

    var resp = random(options)
    return resp
}

async function nProfiles(n) {
    var profiles = []
    for (var i=0; i<=n; i++){
        var sex = await randomSex()
        var nation = await randomNation()
        var name = await randomName(nation, sex)
        var pic = await randomPic(nation, sex)
        var lang = await randomLanguage(nation)
        var greeting = await randomGreeting(lang)
        var spouse = await randomSpouse(nation, sex)
        var expect = await lifeExpectancy(nation, sex)
        var child = await childExpectancy(nation)
        var industry = await randomIndustry(nation)
        var profile = [sex, nation, name, pic, lang, greeting, spouse, expect, child, industry]    
        profiles.push(profile)
    }
    return profiles
}

async function updateProfile(profiles, divs, i) {
        var sex = profiles[i][0]
        var nation = profiles[i][1]
        var name = profiles[i][2]
        var pic = profiles[i][3]
        var lang = profiles[i][4]
        var greeting = profiles[i][5]
        var firstName = name.split(' ')[0]
        var spouse = profiles[i][6]
        var expect = profiles[i][7]
        var child = profiles[i][8]
        var industry = profiles[i][9]

        var div = divs[i];

        var nationDiv = div.getElementsByClassName('profile-flag')[0];
        nationDiv.src = `assets/img/flags/${nation}.svg`

        var nameDiv = div.getElementsByClassName('profile-name')[0]
        nameDiv.innerHTML = name;

        var picDiv = div.getElementsByClassName('profile-pic')[0];
        picDiv.src = pic

        var greetingSpan = div.getElementsByClassName('profile-greeting')[0];
        greetingSpan.innerHTML = greeting

        var firstNameSpan = div.getElementsByClassName('profile-first-name')[0];
        firstNameSpan.innerHTML = firstName

        var spouseNameSpan = div.getElementsByClassName('profile-spouse-name')[0];
        spouseNameSpan.innerHTML = spouse

        var lifeExpectancySpan = div.getElementsByClassName('profile-life-expectancy')[0];
        lifeExpectancySpan.innerHTML = expect

        var childExpectancySpan = div.getElementsByClassName('profile-child-expectancy')[0];
        childExpectancySpan.innerHTML = child

        var childRenSpan = div.getElementsByClassName('profile-child-ren')[0];
        if (child > 1) {
            childRenSpan.innerHTML = 'ren'
        } else {
            childRenSpan.innerHTML = ''
        }

        var industrySpan = div.getElementsByClassName('profile-industry')[0];
        industrySpan.innerHTML = industry

}


async function updateProfiles(repeat_rate) {
    var profiles = await nProfiles(7)
    let divs = document.getElementsByClassName('profile-div');
    for(i=0; i<=divs.length-1; i++) {
        setTimeout(function(i) {
            updateProfile(profiles, divs, i)
        },repeat_rate, i);
    }
}

async function profile(repeat_rate) {
    updateProfiles(0)
    var cycle_rate = repeat_rate * 7
    var intervalIDProfile = setInterval(() => { 
        updateProfiles(repeat_rate)
    }, cycle_rate);

}


const fs = require("fs");
const axios = require("axios");
// const pdfkit = require("pdfkit");
const inquirer = require("inquirer");
const puppeteer = require("puppeteer");
const genHTML = require("./generateHTML");

//console.log(genHTML.colors);
//console.log(genHTML.generateHTML);

function init() {
    launchApp();
}


async function launchApp () {

    let username = await inquirer.prompt({
        message: "Input the GitHub name",
        name: "name"
    });
    
    let color = await inquirer.prompt({
        type: "list",
        message: "Input your favourite color",
        name: "color",
        choices: ['green', 'pink', 'blue', 'red']
    });
    //console.log(username);
    let name = username.name;
    //console.log(name);
    const queryUrl = `https://api.github.com/users/${name}`
    const starredQuery = `https://api.github.com/users/${name}/starred`
    //console.log(queryUrl);
    let gitHubData = await getAPIResults(queryUrl, starredQuery);
    // console.log(gitHubData);

    gitHubData.color = validateColor(color.color);

    const html = genHTML.generateHTML(gitHubData);
    const filename = gitHubData.name;

    generatePDF(filename, html);
}

async function getAPIResults (queryUrl, starredQuery) {
    let results = {};
    let data = await axios.get(queryUrl);
    let reposData = await axios.get(starredQuery); // call to get the stars 
    //console.log(reposData);
    let starGazers = [];
    for (repo of reposData.data) {
        starGazers.push(repo.stargazers_count);
    }

    // here populating the necessary parameters from the results of both queries
    results.img = data.data.avatar_url;
    results.name = data.data.name;
    results.company = data.data.company;
    results.location = data.data.location;
    results.gitHubLink = data.data.html_url;
    results.blogLink = data.data.blog;
    results.bio = data.data.bio;
    results.repNum = data.data.public_repos;
    results.followerNum = data.data.followers;
    try {
        results.starsNum = starGazers.reduce((accum, current) => accum + current); // in case if there are no stargazers, will set to 0
    }
    catch {
        results.starsNum = 0;
    }
    results.followingNum = data.data.following;
    //console.log(results);
    return results;
}

function validateColor(color) {
    console.log(genHTML.colors);
    console.log(color);
    if (genHTML.colors.hasOwnProperty(color)) {
        return color;
    }
    else {
        console.log("This color is not preset, choosing default color green");
        return 'green';
    }
}

async function generatePDF(filename, html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.screenshot({ path: `./results/output.png` }); // dirty hack to make html page actually render with style
    await page.pdf({path: `./results/${filename}.pdf`, format: 'A4'})    
    await browser.close()
    fs.unlinkSync(`./results/output.png`); // removing an extra screenshot
    }


init();

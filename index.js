const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const puppeteer = require("puppeteer");
const genHTML = require("./generateHTML");


function init() {
    launchApp();
}

// function to launch entire application
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
    let name = username.name;
    const queryUrl = `https://api.github.com/users/${name}`
    const starredQuery = `https://api.github.com/users/${name}/starred`
    let gitHubData = await getAPIResults(queryUrl, starredQuery);

    gitHubData.color = validateColor(color.color);

    const html = genHTML.generateHTML(gitHubData);
    const filename = gitHubData.name;

    generatePDF(filename, html);
}

// function to get gitHub data and populate the output (object)
async function getAPIResults (queryUrl, starredQuery) {
    let results = {};
    let data = await axios.get(queryUrl);
    let reposData = await axios.get(starredQuery); // call to get the stars 

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

    return results;
}

// function to check if the color selected actually exists in the presets
function validateColor(color) {

    if (genHTML.colors.hasOwnProperty(color)) {
        return color;
    }
    else {
        console.log("This color is not preset, choosing default color green");
        return 'green';
    }
}

// function to generate the pdf out of the html provided
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

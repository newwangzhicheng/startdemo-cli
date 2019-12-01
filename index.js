#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
//模板
const templates ={
    'd': {
        url: 'https://github.com/newwangzhicheng/startdemo-template',
        downloadUrl: 'https://github.com:newwangzhicheng/startdemo-template#master',
        description: '默认模板'
    }
};
program.version('1.0.0', '-v, --version')
    .command('init <projName> <tempName>')
    .action((projName, tempName) => {
        init(projName, tempName);
    });
program.parse(process.argv);

function init(projName, tempName){
    let downloadUrl;
    if(tempName == "d" || tempName == "default"){
        downloadUrl = templates['d'].downloadUrl;
        console.log(downloadUrl);
    } else if(templates[tempName] !== undefined){
        downloadUrl = templates[tempName].downloadUrl;
    } else {
        console.log("模板不存在（默认d, default）");
        return;
    }
    if(!fs.existsSync(projName)){
        inquirer.prompt([
            {
                name: 'description',
                message: '请输入项目描述'
            }
        ]).then((answers) => {
            const spinner = ora('正在下载模板...').start();
            download(downloadUrl, projName, {clone: true}, (err) => {
                if(err){
                    console.log(symbols.error, chalk.red(err));
                    spinner.fail("下载失败");
                }else{
                    spinner.succeed();
                    const fileName = `${projName}/package.json`;
                    const meta = {
                        projName,
                        description: answers.description,
                    }
                    if(fs.existsSync(fileName)){
                        const content = fs.readFileSync(fileName).toString();
                        const result = handlebars.compile(content)(meta);
                        fs.writeFileSync(fileName, result);
                    }
                    console.log(symbols.success, chalk.green('项目初始化完成'));
                }
            })
        })
    }else{
        // 错误提示 项目已存在，避免覆盖原有项目
        console.log(symbols.error, chalk.red('项目已存在'));
    }
}
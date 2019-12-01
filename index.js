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
        let downlodaUrl;
        if(tempName){
            downlodaUrl = templates[tempName].downloadUrl;
        } else {
            downloadUrl = templates['d'].downloadUrl;
        }
        if(!fs.existsSync(projName)){
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                }
            ]).then((answers) => {
                const spinner = ora('正在下载模板...').start();
                download(downlodaUrl, projName, {clone: true}, (err) => {
                    if(err){
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
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
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
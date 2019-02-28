# Onboarding
***
### Introduction 
In this document we'll walk through the setup for the Central End User Registry. It consists of three sections:

* [Software List](#software-list)
* [Setup](#setup)
* [Errors On Setup](#errors-on-setup)

***

### Software List
1. Github
2. brew
3. Docker
4. MySQL
5. pgAdmin4
6. Visual Studio Code
7. nvm
8. npm
9. central\_end\_user_registry

***

### Setup
Make sure you have access to [Mojaloop on Github](https://github.com/mojaloop/central-end-user-registry) and clone the project.

To install Homebrew run this in a terminal window:
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

To install Docker, follow these instructions: [Docker for Mac](https://docs.docker.com/docker-for-mac/)

To install Visual Studio Code, follow these instructions: [Visual Studio Code](http://code.visualstudio.com)

##### Setup Docker
* Run the following commands in your terminal.
```
docker run -p 3306:3306 -d --name mysql -e MYSQL_USER=central_end_user_registry -e MYSQL_PASSWORD=cVq8iFqaLuHy8jjKuA -e MYSQL_DATABASE=central_end_user_registry -e MYSQL_ALLOW_EMPTY_PASSWORD=true mysql/mysql-server:5.7
```
* MySQL should now be installed
* run `docker ps` to verify Docker is running

##### Setup pgAdmin4
* create a central_end_user_registry user by right clicking on **Login/Group Roles** and then **Create**
* right click on the central_end_user_registry user and select **Properties**
* make sure the username and password match the username and password in the .env file
* click on privileges and set **Can login?** to **Yes**

##### Setup nvm & npm
* run `curl -udwolla:AP6vR3LGrB6zm8WQjLvJHnQzjJp "https://modusbox.jfrog.io/modusbox/api/npm/level1-npm/auth/@mojaloop" >> ~/.npmrc`
* run `cp ~/.npmrc .npmrc` which will allow you to run the functional tests on your machine
* to install nvm run `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash`
* create a *.bash_profile* file with `touch ~/.bash_profile` and verify your *.bash_profile* looks like this:
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
export CREG_DATABASE_URI=mysql://central_end_user_registry:cVq8iFqaLuHy8jjKuA@localhost:3306/central_end_user_registry
```

* cd into the central_directory project
* run `nvm install 10.15.1`
* run `nvm use`
* run `npm install -g node-gyp`
* run `brew install libtool autoconf automake`
* run `npm install`
* run `source ~/.bash_profile`
* run `npm rebuild`
* run `npm start` *(to run it locally)* or `npm run dev` *(to run it on your Docker host)*

### Errors On Setup
* `./src/argon2_node.cpp:6:10: fatal error: 'tuple' file not found` 
  - resolved by running `CXX='clang++ -std=c++11 -stdlib=libc++' npm install argon2`

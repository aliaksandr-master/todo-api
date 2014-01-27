# installation programs
nodejs
npm
mysqldump

# exec for install
npm install -g grunt-cli
npm install -g bower

# exec for build node deps and build the project
npm install

# update build:
npm install
* or
grunt install build
* or
grunt install watcher

# deployment build
npm install
grunt build_testing build_production build_development
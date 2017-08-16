# Templating Tool

### Development Setup
##### Step 1:
Clone the repository
```
$ git clone git@github.com:ohmygreen/menu-templating.git
```

##### Step 2:
Change directory to the cloned repo
```sh
cd menu-templating
```
##### Step 3:
You’ll need to create a `.env` file in the root directory with the following variables declared:

 ```
GOOGLE_SHEETS_ID = xxxxxxxxxxxxxxxxxxxx
GOOGLE_SHEETS_API_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
##### Step 4:

###### To spin up the development server, run these commands in the terminal:
Step 1:
```
$ npm install
```
Step 2:
```
$ bower install
```
Step 3:
```
$ gulp
```

You should now be able to navigate to the server address in your preferred browser.
```sh
localhost:7777
```

### API Route
To download menus and dishes from spree, you can supply the menu id in the format below

```
/api/menus/:menu_id
```
where `:menu_id` is of type `Number` and you will get a response in this format
```
[
    {
        type: "dish",
        title: "Cashew Chicken",
        url: "localhost:7777/files/cashew chicken.jpeg"
    },
    {
        type: "dish",
        title: "Eggplant Parmesan",
        url: "localhost:7777/files/eggplant parmesan.jpeg"
    }, 
    {
        type: "dish",
        title: "Super Awesome Brownies",
        url: "localhost:7777/files/super awesome brownies.jpeg"
    },
    {
        type: "menu",
        title: "Annie's Menu",
        url: "localhost:7777/files/annie's menu.jpeg"
    }
]
```

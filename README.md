
## Code convention

ref : https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md

## BoilerPlate Code

ref : https://awesome-nestjs.com/resources/boilerplate.html

## App Function
- need to know
    - [ ]  : means that function is not tested(auto, manual) 
    - [x]  : means that function is tested(auto, manual) 

### DB
- [x] Manage Painting Table
    - [x] Manage Painting's Tag Table
    - [x] Manage Painting's Style Table
    - Detail
        - Main Table which has relation to almost other tables
        - only admin insert and update it ( it will be updated that other user either can do) 
- [x] Manage Artist Table
    - Detail
        - only admin insert and update it ( it will be updated that other user either can do)

### Painting Module
- [x] get Paintings By Title and ArtistName and Tag and Styles
    - [x] provide logic by HTTP Api
- [x] get Paintings By Id list 
- [x] create Painting 

#### Tag Module
- child module of Painting Module
- HTTP Api is based on CRUD Lib
    ref : https://gid-oss.github.io/dataui-nestjs-crud
- [x] get Tag
    - [x] provide logic by HTTP Api
- [x] create Tag
    - [x] provide logic by HTTP Api
- [x] delete Tag
    - [x] provide logic by HTTP Api
- [x] replace Tag
    - [x] provide logic by HTTP Api

### Quiz Module
- [x] generate Random Quiz
    - [x] provide logic by HTTP Api
- [x] create Quiz
    - [x] provide logic by HTTP Api
- [x] update Quiz
    - [x] provide logic by HTTP Api
    - detail
        - disable to update Quiz type. the other is able to be updated
- [x] get one Quiz data by id
    - [x] provide logic by HTTP Api
    - detail
        - use other filter option 
            ref : https://gid-oss.github.io/dataui-nestjs-crud/controllers/#options 

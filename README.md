
## Code convention

ref : https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md


### method & function

- Controller method name should specify returned data's name
    - Service method name is optional. But service method should specify returned data's name, If it returns data not managed by service.

```ts
@Controller('user')
Class UserController(private only service : UserService){

    //controller method name should specify returned data's name
    @Get('/:id')
    async findUser(@Param('id') id : string){
        return this.service.getById(id);
    }

    @Get('/:id/sale')
    async findSaleByUser(@Param('id') id : string){
        const user = await this.service.getById(id);

        //should specify 'Sale' because Sale data is not managed by UserService
        return this.service.getSale(user);
    }
}
``` 

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
    - [x] provide logic by HTTP Api
- [x] replace Painting
    - [x] provide logic by HTTP Api
- [x] delete Painting
    - [x] provide logic by HTTP Api

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

#### Style Module
- child module of Painting Module
- HTTP Api is based on CRUD Lib
    ref : https://gid-oss.github.io/dataui-nestjs-crud
- [x] get Style
    - [x] provide logic by HTTP Api
- [x] create Style
    - [x] provide logic by HTTP Api
- [x] delete Style
    - [x] provide logic by HTTP Api
- [x] replace Style
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

# Docker 

## Build image 

1. .env.production 파일 생성
- .sample.env 참조

2. .env.production.gpg 파일 생성
- 다음 명령어를 실행후, 암호 입력
```bash
$ gpg -c .env.production
```


3. 환경 변수 설정 및 빌드 명령어 실행
```bash
$ export GPG_TOKEN='password_env.production'
$ docker build --secret id=GPG_TOKEN,env=GPG_TOKEN --no-cache --progress=plain -t my-nestjs-app . &> build.log
```


## Run Container in local

### Log Mount with volume 
- 컨데이터 실행전, 옵션 설정에서 Volume path 설정
    - source : mount할 host pc
    - dest : /app/logs
        - 해당 경로에 web log와 typeorm log 모두 존재
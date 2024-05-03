made using. This makes full stack, scr/client is the front end and scr/server is the backend. 
```
npm create vite-express
```

how I set up aws ec2 setup:
    - Create an EC2 instance (Ubuntu)
    - Connect to the instance (I did using SSH (ssh -i /path/key-pair-name.pem instance-user-name@instance-public-dns-name) )
    - update the instance (sudo apt-get update). install apache2 (sudo apt-get install apache2)
    - Got to 'Route 53' on aws and create a hosted zones
    - After you entered your domain and clicked 'Create hosted zone', 
    - Click 'Create Record'
    - Followed from [this](https://www.freecodecamp.org/news/how-to-connect-a-domain-to-a-website-hosted-on-aws-ec2/)

How to Setup node server to work:
    - Followed from [this](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)

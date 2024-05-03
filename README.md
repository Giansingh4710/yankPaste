made using. This makes full stack, scr/client is the front end and scr/server is the backend. 
```
npm create vite-express
```

### How I set up aws ec2 setup:
- Create an EC2 instance (Ubuntu)
- Got to 'Route 53' on aws and create a hosted zones
- After you entered your domain and clicked 'Create hosted zone', 
- Click 'Create Record'
- Followed from [this](https://www.freecodecamp.org/news/how-to-connect-a-domain-to-a-website-hosted-on-aws-ec2/)

### How to Setup node server to work:
- Followed from [this](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)
- Following [this youtube video](https://www.youtube.com/watch?v=bBA2yCnEf68)
- login to the server
- ```sudo apt update && sudo apt upgrade```
- ```
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
    sudo apt-get install -y nodejs
    ```
- ```node -v && npm -v``` to see if it is installed
- ```sudo apt install nginx```
- Firewall Stuff (idk)
    - ```sudo ufw allow OpenSSH```
    - ```sudo ufw allow 'Nginx HTTP'```
    - ```sudo ufw enable``` (click y)
    - ```sudo ufw status``` (to check if it is enabled)
- At this point you should be able to see the nginx page when you go to the ip address of the server
    - ```curl 54.226.218.23``` (this should work too if done correctly)
- For Domain Setup
    - ```sudo mkdir /var/www/yankpaste.com```
    - ```sudo chown -R $USER:$USER /var/www/yankpaste.com```
    - ```sudo vim /etc/nginx/sites-available/yankpaste.com```
        - copy this into the file:
            ```
            server {
                server_name yankpaste.xyz www.yankpaste.xyz;

                location / {
                    proxy_pass http://localhost:3000;
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
                }
            }
            ```
    - ```sudo ln -s /etc/nginx/sites-available/yankpaste.com /etc/nginx/sites-enabled/yankpaste.com```
    - ```sudo nginx -t``` to check if syntax is correct
    - ```sudo nginx -s reload``` to reload nginx
- At this point, if you clone repo into `/var/www/yankpaste.com` and do 'sudo npm run dev', yankpaste.xyz should work(http only)


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
- ```sudo npm install pm2@latest -g``` keep server in background
- ```sudo pm2 startup systemd``` (it will give you a command to run. Run it. Command for me is below)
    ```sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu```
- ```pm2 start npm --name yankPaste -- start```
    - ```pm2 kill``` (will kill the server if needed)
- ```pm2 save``` (when pm2 restarts, it will start the server again)

### How to setup https
- ```sudo ufw allow 'Nginx Full'```
- ```sudo apt install certbot python3-certbot-nginx```
- ```sudo certbot --nginx -d yankpaste.xyz -d www.yankpaste.xyz```
<!-- - ```sudo certbot renew --dry-run``` (to check if it works) -->
- ```sudo systemctl status certbot.timer``` (to check if it is working)
- ```sudo ufw delete allow 'Nginx HTTP'```
- ```sudo ufw status``` (will have 'Nginx Full' now instead of 'Nginx HTTP')


Following [this youtube video](https://www.youtube.com/watch?v=bBA2yCnEf68)

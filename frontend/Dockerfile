FROM nginx
RUN echo "copying over nginx configuration"
COPY nginx/nginxconfig.io-webexscreenshare-frontend/ /etc/nginx/
RUN ls -la /etc/nginx/
COPY  build/ /var/www/webexscreenshare-frontend/public

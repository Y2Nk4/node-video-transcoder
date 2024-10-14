FROM node:16

ENV HOME /root
WORKDIR /root

COPY . .

RUN rm -rf ./node_modules

RUN npm install

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

EXPOSE 23315
CMD /wait && npm run start


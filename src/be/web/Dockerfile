FROM node:latest as builder
EXPOSE 3333
WORKDIR /be
COPY . /be
RUN npm install && \
	npm run build

RUN chmod 744 ./startup.sh
CMD ["./startup.sh"]
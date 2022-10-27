FROM node:latest as builder
EXPOSE 3000
WORKDIR /fe
COPY . /fe
RUN npm install && \
	npm run build

CMD ["npm", "run", "start"]
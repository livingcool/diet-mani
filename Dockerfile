FROM node:20-alpine
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN npm run build
RUN chown -R node:node /home/node/app
EXPOSE 7860
ENV NODE_ENV=production
ENV PORT=7860
USER node
CMD ["npm", "run", "start"]




# # backend/Dockerfile

# FROM node:22-alpine

# WORKDIR /app

# # Copy only package files first
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the backend source code
# COPY . .

# # Expose backend port
# EXPOSE 3000

# # Start in development mode
# CMD ["npm", "run", "dev"]


# Stage 1 - Build Frontend
FROM node:22-alpine as frontend

WORKDIR /app

# Since context is root, you can access frontend now
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2 - Setup Backend with built frontend
FROM node:22-alpine

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./
RUN npm install

# Copy backend code
COPY backend .

# Copy frontend build into backend expected folder
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Start app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]

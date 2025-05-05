
# 🖼️ Image Processing Service

## Overview
This is a Node.js-based backend service for handling asynchronous image processing tasks such as uploading, retrieving and performing transformations on images. The system is built with scalability in mind using Amazon S3 and PostgreSQL for storage, and RabbitMQ for task queuing. 


## 🚀 Features

- Upload images to S3
- Extract and return image metadata
- Asynchronously apply different image transformations via RabbitMQ
- Save transformed image results back to S3
- Current Supported transformations rotate, flip, resize, crop, change file format, grayscale, and sepia.

## 📦 Tech Stack

- **Node.js** / **Express** – API framework
- **Amazon S3** – Cloud storage for uploaded and transformed images
- **PostgreSQL** – Relational database for image records
- **RabbitMQ** – Asynchronous job queue for image transformation

## ⚙️ Installation
### Prerequisites
Ensure you have the following installed:
- Node.js (>= 16.x)
- PostgreSQL
- RabbitMQ

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/jamesh21/image-processing-service
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure environment variables:

   - Create a `.env` file in the project directory and add the following:
   ```ini
    PORT=3000
    DB_USER=your-local-postgres-db-username
    DB_HOST=your-local-postgres-db-host
    DB_NAME=your-local-postgres-db-name
    DB_PASSWORD=your-local-postgres-pw
    DB_PORT=your-local-postgres-port
    JWT_SECRET=your-jwt-secret
    JWT_LIFETIME=your-jwt-lifetime
    AWS_ACCESS_KEY_ID=your-aws-key-id
    AWS_SECRET_ACCESS_KEY=your-aws-secret
    AWS_REGION=your-aws-region
    S3_BUCKET_NAME=your-s3-bucket

   ```

4. Start Postgres and RabbitMQ server locally


6. Run DB Script
    - Run db.sql to generate postgres tables


## 🕹️ Running the Project

### Start API Server

\`\`\`bash
npm start
\`\`\`

### Start RabbitMQ Consumer

\`\`\`bash
node consumer.js
\`\`\`

## 📤 API Endpoints

### Authentication
- `POST /api/v1/auth/register` – Register new user
- `POST /api/v1/auth/login` – Login user

### Upload an Image
- `POST /api/images/` - Uploads image

### Retrieve Image
- `GET /api/images/:imageId` - Retrieves image associated with image Id
- `GET /api/images?page=1&limit=5` - Retrieves image uploaded by logged in user, can accept pagination

### Transform an Image
- `POST /api/images/:imageId/transform - Performs transformations on image Id
**Sample transformation option to pass in:**
\`\`\`json
{
    "transformations": {
      "resize": {
        "width": 400,
        "height": 400
      },
      "format": "png",
      "flip": true,
      "grayscale": true,
      "sepia": true
    }
}
\`\`\`


## 🛠 Future Improvements
- Add caching for transformed images (e.g., Redis)
- Build a frontend dashboard


## 📄 License
MIT


## Contributors
- *James Ho* – Developer


## Contact
For any inquiries or contributions, feel free to reach out:
- GitHub: [jamesh21](https://github.com/jamesh21)

## Credit
This project idea is from [roadmap.sh](https://roadmap.sh/projects/image-processing-service)
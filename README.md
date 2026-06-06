# City Lakers United Portal

This portal now includes a Safaricom STK Push backend integration using the Daraja sandbox.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and fill in your Safaricom credentials:
   - `CONSUMER_KEY`
   - `CONSUMER_SECRET`
   - `BUSINESS_SHORT_CODE`
   - `PASSKEY`
   - `CALLBACK_URL`

3. Start the server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser.

## Notes

- The STK Push form now sends requests to `/api/stkpush`.
- Actual payment requests require valid Safaricom Daraja sandbox credentials.
- Use the admin login credentials from the frontend, then submit a phone number starting with `2547`.  
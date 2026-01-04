# Matignon-LSF Integration

This project includes a pipeline to use the dataset from [JulieLascar/Matignon-LSF](https://github.com/JulieLascar/Matignon-LSF).

## How to use Real Data

The repository tools are installed in `tools/Matignon-LSF`.

### 1. Download Data
You must first download the video files and subtitles using the python scripts provided by the Matignon-LSF authors.

1.  Navigate to `tools/Matignon-LSF/collecting_data`.
2.  Follow the instructions in their repository (usually involves running a python script to scrape YouTube).
3.  **Ensure you have `.mp4` and `.srt` files**.

### 2. Import into App
Once you have the files:

1.  Copy all `.mp4` and `.srt` files into:
    `tools/Matignon-LSF/data/`
    *(Create this folder if it doesn't exist)*

2.  Run the import script:
    ```bash
    npx tsx scripts/import_matignon.ts
    ```

### 3. Result
The script will:
- Copy the videos to `public/matignon/videos/`.
- Generate `public/matignon/index.json`.
- The App will now use these videos automatically.

## Technical Details
- The importer uses "Media Fragments" (`#t=start,end`) to play specific parts of the long video files corresponding to each word/gloss.
- The matching logic currently does a simple keyword extraction from the French subtitles.

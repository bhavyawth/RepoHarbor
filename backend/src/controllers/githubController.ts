import { Request, Response } from "express";
import { getRepoDetails, getRepoContents, getFileContent } from "../services/githubService";
import { chunkText } from "../services/chunkService";
/**
 * GET /repos/:owner/:repo
 * Fetch high-level repository details (name, description, stars, default branch, etc.)
 */
export const getRepoDetailsController = async (req: Request, res: Response) => {
    try {
        const { owner, repo } = req.params;
        const details = await getRepoDetails(owner, repo);
        return res.status(200).json(details);
    } catch (error) {
        console.error("Error in getRepoDetailsController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * GET /repos/:owner/:repo/contents
 * List files and directories within the repository
 */
export const getRepoContentsController = async (req: Request, res: Response) => {
    try {
        const { owner, repo } = req.params;
        let folderPath = req.params.folderPath;
        if (!folderPath) folderPath = '';
        if (Array.isArray(folderPath)) {
            folderPath = folderPath.join('/');
        }
        const branch = (req.query.branch as string) || undefined;
        const contents = await getRepoContents(owner, repo, folderPath, branch);
        return res.status(200).json(contents);
    } catch (error) {
        console.error("Error in getRepoContentsController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * GET /repos/:owner/:repo/files/*filePath
 * Fetch raw content of a specific file in the repository
 */
export const getFileContentController = async (req: Request, res: Response) => {
    try {
        let filePath = req.params.filePath;
        if (Array.isArray(filePath)) filePath = filePath.join('/');
        const { owner, repo } = req.params;
        const branch = (req.query.branch as string) || undefined;
        if (!filePath) {
            return res.status(400).json({ message: "File path is required." });
        }
        const content = await getFileContent(owner, repo, filePath, branch);
        return res.status(200).json({ repo, filePath, content });
    } catch (error) {
        console.error("Error in getFileContentController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
/**
 * GET /repos/:owner/:repo/files/*filePath/chunks
 * Fetch raw content of a specific file and split it into chunks
 */
// export const getChunkedFileContentController = async (req: Request, res: Response) => {
//     try {
//         let filePath = req.params.filePath;
//         if (Array.isArray(filePath)) filePath = filePath.join('/');
//         const { owner, repo } = req.params;
//         const branch = (req.query.branch as string) || undefined;
//         if (!filePath) {
//             return res.status(400).json({ message: "File path is required." });
//         }
//         const content = await getFileContent(owner, repo, filePath, branch);
//         const chunks = chunkText(content, `${owner}/${repo}`, filePath, 2000, 200);

//         return res.status(200).json({
//             repo,
//             filePath,
//             totalChunks: chunks.length,
//             chunks
//         });
//     } catch (error) {
//         console.error("Error in getChunkedFileContentController:", error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };

import get from "lodash.get";
import {getOctokit} from '@actions/github'
import {getInput} from '@actions/core'

type Commit = {
    message: string;
};

const extractCommits = async (context): Promise<Commit[]> => {
    // For "push" events, commits can be found in the "context.payload.commits".
    const pushCommits = Array.isArray(get(context, "payload.commits"));
    if (pushCommits) {
        return context.payload.commits;
    }

    // For PRs, we need to get a list of commits via the GH API:
    const prCommitsUrl = get(context, "payload.pull_request.commits_url");
    if (prCommitsUrl) {
        try {
            const token = getInput('github-token')
            const github = getOctokit(token).rest

            const params = {
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: context.payload.pull_request.number
            }
            const data = await github.pulls.listCommits(params);

            if (Array.isArray(data)) {
                return data.map((item) => item.commit);
            }
            return [];
        } catch {
            return [];
        }
    }

    return [];
};

export default extractCommits;

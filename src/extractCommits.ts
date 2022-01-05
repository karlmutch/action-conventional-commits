import get from "lodash.get";
import {getOctokit} from '@actions/github'
import {getInput} from '@actions/core'

type Commit = {
    message: string;
};

const extractCommits = async (context): Promise<Commit[]> => {
    console.log({context})
    // For "push" events, commits can be found in the "context.payload.commits".
    const pushCommits = Array.isArray(get(context, "payload.commits"));
    console.log({pushCommits})
    if (pushCommits) {
        return context.payload.commits;
    }

    // For PRs, we need to get a list of commits via the GH API:
    const prNumber = get(context, "payload.pull_request.number");
    console.log({prNumber})
    if (prNumber) {
        try {
            const token = getInput('github-token')
            const github = getOctokit(token).rest

            const params = {
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: prNumber
            }
            console.log({params})
            const data = await github.pulls.listCommits(params);
            console.log({data})

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

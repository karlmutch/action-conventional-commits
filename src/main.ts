import { context } from "@actions/github";
import * as core from "@actions/core";

import isValidCommitMessage, { getValidCommitTypes } from "./isValidCommitMessage";
import extractCommits from "./extractCommits";

async function run() {
    core.info(
        `ℹ️ Checking if commit messages are following the Conventional Commits specification...`
    );

    const extractedCommits = await extractCommits(context);
    if (extractedCommits.length === 0) {
        core.info(`No commits to check, skipping...`);
        return;
    }

    const rawOverrideCommitTypes = core.getInput('valid-commit-types')
    const overrideCommitTypes = rawOverrideCommitTypes ? JSON.parse(rawOverrideCommitTypes) : undefined
    let hasErrors;
    for (let i = 0; i < extractedCommits.length; i++) {
        let commit = extractedCommits[i];
        if (isValidCommitMessage(commit.message, overrideCommitTypes)) {
            core.info(`✅ ${commit.message}`);
        } else {
            core.info(`🚩 ${commit.message}`);
            hasErrors = true;
        }
    }

    if (hasErrors) {
        const validCommitTypesList = getValidCommitTypes(overrideCommitTypes).join(', ')
        core.setFailed(
            `🚫 According to the conventional-commits specification, some of the commit messages are not valid.
            Accepted types: ${validCommitTypesList}.`
        );
    } else {
        core.info("🎉 All commit messages are following the Conventional Commits specification.");
    }
}

run();

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {

  try {
    const token = core.getInput('token'),
          owner = core.getInput('owner') || github.context.repo.owner,
          repo = core.getInput('repo') || github.context.repo.repo,
          title_prefix = core.getInput('title') || 'Automatic data update',
          title = title_prefix + ` - ${new Date().toISOString().substring(0,10)}`,
          base = core.getInput('base') || 'master',
          makeComment = core.getInput('makeComment') || 'true',
          comment = core.getInput('comment') || 'New data pushed!',
          dataUpdateBranch = core.getInput('dataUpdateBranch'),
          dataUpdateBranchId = owner + ':' + dataUpdateBranch;

    const client = new github.GitHub(token);

    console.log(`CHECKING PRs: ${owner}/${repo} ${dataUpdateBranchId}`);

    const PRs = await client.pulls.list({
      owner: owner,
      repo: repo,
      head: dataUpdateBranchId,
      state: 'open'});

    if(PRs.data.length > 0 && PRs.data[0].head.label == dataUpdateBranchId) {
      const issue_number = PRs.data[0].number;

      if(makeComment == 'true') {
        console.log('COMMENTING ON PR...');
        await client.issues.createComment({
          owner: owner,
          repo: repo,
          issue_number: issue_number,
          body: comment,
        });

        console.log(`COMMENTED ON PR #${issue_number}`);
      } else {
        console.log(`SKIP COMMENTING ON PR #${issue_number}`);
      }
    } else {
      console.log(`CREATING PR: ${owner}/${repo} HEAD ${dataUpdateBranchId} BASE ${base}...`);

      await client.pulls.create({
        owner: owner,
        repo: repo,
        title: title,
        head: dataUpdateBranchId,
        base: base,
        maintainer_can_modify: true,
      });

      console.log('PR CREATED.');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

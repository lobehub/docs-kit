import Callout from '../Callout';

export default () => (
  <div>
    <Callout title="Info">Each page needs a title and a description.</Callout>
    <Callout title="Tip" type="tip">
      Name demo files after the idea they show.
    </Callout>
    <Callout title="Warning" type="warning">
      A JSDoc default that disagrees with the runtime default fails the build.
    </Callout>
  </div>
);

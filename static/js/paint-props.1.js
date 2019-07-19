
class Box extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    getClassName() {
        return `box ${this.props.color} ${this.props.selected}`
    }

    handleClick() {
        this.props.callback(this.props.color);
    }

    render() {
        return (
            <div className={this.getClassName()} onClick={this.handleClick}></div>
        );
    }
}

class Tile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: "white"
        };
        this.paint = this.paint.bind(this);
    }

    paint() {
        if (this.props.isDrawing) {
            this.setState({ color: this.props.color });
        } 
    }

    render() {
        var color = this.state.color;
        var className = "tile " + color;
        return (
            <div className={className}  onMouseMove={this.paint}></div>
        );
    }
}

class PaintApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: "blue",
            isDrawing: false
        }
        this.changeColor = this.changeColor.bind(this);
        this.draw = this.draw.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
    }

    changeColor(color) {
        this.setState({
            color: color
        });
    }

    draw() {
        console.log("drawing");
        this.setState({ isDrawing: true })
    }

    stopDrawing() {
        console.log("stop drawing");
        this.setState({ isDrawing: false })
    }

    render() {
        var tiles = [];
        var size4Px = 23350;
        var size2Px = 23250;
        var size1Px = 52350;

        for (var i = 0; i < size1Px; i++) {
            tiles.push(<Tile color={this.state.color} isDrawing={this.state.isDrawing} key={`tile${i}`} />);
        }
        var colors = this.props.colors
            .map(color => {
                var selectedClass = this.state.color === color? "selected" : "";
                return <Box color={color} callback={this.changeColor} selected={selectedClass} key={color}> </Box>
            });
        var login = this.props.username ? <div>Hello {this.props.username}</div> :
            <form method="post" action="/login">
                <input name="username" placeholder="username" />
                <input type="password" name="password" placeholder="password" />
                <input type="hidden" name="next_url" value="{{next_url}}" />
                <input type="submit" value="signup/login" />
            </form>;
        return (
            <div>
                <div>
                    {login}
                </div>
                {colors}
                <div onDragLeave={()=>this.stopDrawing} onMouseUp={this.stopDrawing} 
                onMouseDown={this.draw} className="board">
                    {tiles}
                </div>
            </div>
        );
    }
}


window.render = function () {
    var username = window.getCookie("username");
    console.log(username);
    if (username) {
        console.log(username)
    }
    var colors = ["green", "blue", "pink", "purple"];

    ReactDOM.render(
        <PaintApp colors={colors} username={username} />,
        document.getElementById("root")
    );
}

window.getCookie = function (name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

window.render();

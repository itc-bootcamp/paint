
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
            color: this.props.color || "white"
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
            <div className={className} onMouseMove={this.paint} key={this.props.key}
                style={{ top: this.props.y, left: this.props.x }}></div>
        );
    }
}

class PaintApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: "blue",
            isDrawing: false,
            tiles: [],
            paintingName: "",
            paintings: []
        }
        this.brushSizes = [2, 4, 6, 8];
        this.changeColor = this.changeColor.bind(this);
        this.startDrawing = this.startDrawing.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
        this.draw = this.draw.bind(this);
        this.save = this.save.bind(this);
        this.getPaintingList = this.getPaintingList.bind(this);
        this.deletePainting = this.deletePainting.bind(this);
    }

    changeColor(color) {
        this.setState({
            color: color
        });
    }

    startDrawing() {
        this.setState({ isDrawing: true })
    }

    stopDrawing() {
        this.setState({ isDrawing: false })
    }

    draw(e) {
        if (this.state.isDrawing) {
            var boundaries = e.target.getBoundingClientRect();
            var left = e.pageX - boundaries.left;
            var up = e.pageY - boundaries.top;
            var tile = <Tile key={"" + left + Math.random()} color={this.state.color} x={left} y={up} />
            var newTiles = this.state.tiles.slice();
            newTiles.push(tile);
            this.setState({
                tiles: newTiles
            })
        }
    }

    getPainting(name) {
        $.ajax({
            type: "GET",
            url: "/painting?name=" + name,
            dataType: "json",
            success: (data) => {
                data = JSON.parse(data.painting);
                var newTiles = data.map(x =>
                    <Tile color={x.props.color} x={x.props.x} y={x.props.y} />)
                this.setState({ tiles: newTiles, paintings: [] })
            },
            error: () => { console.log("error saving") }
        });
    }

    deletePainting(name) {
        $.ajax({
            type: "DELETE",
            url: "/delete?name=" + name,
            success: () => {
                this.getPaintingList();
            },
            error: () => { console.log("error delete") }
        });
    }


    getPaintingList() {
        $.ajax({
            type: "GET",
            url: "/paintings",
            dataType: "json",
            success: (data) => {
                this.setState({ paintings: data.paintings });
            },
            error: () => { console.log("error getting painting list") }
        });
    }

    addPainting() {

    }

    save() {
        $.ajax({
            type: "POST",
            url: "/save",
            contentType: "application/json",
            data: JSON.stringify({ painting: this.state.tiles, name: this.state.paintingName }),
            success: () => {
                this.setState({ paintingName: "" });
                this.getPaintingList();
            },
            error: () => { console.log("error saving") }
        });
    }

    render() {
        var colors = this.props.colors
            .map(color => {
                var selectedClass = this.state.color === color ? "selected" : "";
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
                <div className="user">
                    {login}
                </div>
                <div className="content">
                    <div className="menu">
                        <span>Painting Name</span>
                        <input type="text" value={this.state.paintingName} onChange={(e) => this.setState({ paintingName: e.target.value })}></input>
                        <span className="menu-btn" onClick={this.save}>&#x2714;</span>
                        <div className="loaded">
                            <span className="menu-btn" onClick={() => this.getPaintingList()}>Load Paintings</span>
                            <div className="paint-list">
                                {this.state.paintings.map(x =>
                                    <div key={x.name} className="paint-item"
                                        onClick={(e) => { this.getPainting(e.target.textContent) }}>
                                        {x.name}
                                        <button onClick={() => this.deletePainting(x.name)}>&#10008;</button>
                                    </div>)
                                }
                            </div>

                        </div>
                    </div>
                    <div className="menu">
                        {colors}
                    </div>
                    <div className="board" onDragLeave={() => this.stopDrawing()} onMouseUp={this.stopDrawing}
                        onMouseDown={this.startDrawing} onMouseMove={this.draw} >
                        {this.state.tiles}
                    </div>
                </div>
            </div>
        );
    }
}


window.render = function () {
    var username = window.getCookie("username");
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
